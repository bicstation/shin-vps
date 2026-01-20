# -*- coding: utf-8 -*-
import re
import json
import time
import urllib.parse
import requests
import os
import argparse
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# --- 設定 ---
BASE_DIR = "/usr/src/app/scrapers/src"
SAVE_DIR = os.path.join(BASE_DIR, "json")
FINAL_FILE = os.path.join(SAVE_DIR, "mouse_results.json")
OLLAMA_API_URL = "http://ollama-v2:11434/api/generate"
BASE_SEARCH_URL = "https://www.mouse-jp.co.jp/store/goods/search.aspx?search=x&limit=300"

# メモリ6GBのRTX 3050に最適なモデル
REASONING_MODEL = "gemma3:4b" 

os.makedirs(SAVE_DIR, exist_ok=True)

def call_ollama_simple(prompt):
    """ Ollama APIを呼び出してテキストを生成する """
    payload = {
        "model": REASONING_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.1, "num_predict": 1000}
    }
    try:
        # タイムアウトを120秒に設定
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=120)
        res_json = response.json()
        return res_json.get("response", "").strip()
    except Exception as e:
        print(f"❌ Ollama Connection Error: {e}")
        return ""

def ask_ai_about_spec_lite(raw_text, web_price=None):
    """ テキストと価格ヒントからスペックを抽出する """
    # ノイズ削減：製品特長より前の主要スペック部分のみ抽出
    clean_text = raw_text.split("製品特長")[0][:2500]
    
    # 価格情報をプロンプトに組み込む
    price_hint = f"REFERENCE PRICE: {web_price} JPY" if web_price else "REFERENCE PRICE: Unknown"

    prompt = f"""Extract PC specs from the text below as JSON.
{price_hint}
If information is missing, use null.
Return ONLY JSON.

TEXT:
{clean_text}

JSON TEMPLATE:
{{
  "product_name": "string",
  "price": number,
  "cpu": "string",
  "gpu": "string",
  "ram": "string",
  "storage": "string",
  "npu_exists": boolean
}}
"""
    print(f"--- [DEBUG: Sending Prompt with Price Hint: {web_price}] ---")
    raw_res = call_ollama_simple(prompt)
    print(f"--- [DEBUG: AI RAW RESPONSE] ---\n{raw_res}\n")
    
    try:
        # ```json { ... } ``` のような形式から {} 部分だけを抜き出す
        match = re.search(r'\{.*\}', raw_res, re.DOTALL)
        if match:
            extracted_json = json.loads(match.group(0))
            # AIが価格を抜き出せなかった場合、WEBから取得した価格を補完する
            if (extracted_json.get("price") is None or extracted_json.get("price") == 0) and web_price:
                extracted_json["price"] = web_price
            return extracted_json
    except Exception as e:
        print(f"⚠️ JSON Parse Error: {e}")
    
    return {"error": "parse_failed", "raw": raw_res, "price": web_price}

def fetch_detail_info(page, url):
    try:
        print(f"\n🚀 Accessing: {url}")
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        # コンテンツのレンダリング待ち
        page.wait_for_timeout(2000)
        
        content = page.content()
        soup = BeautifulSoup(content, 'html.parser')
        
        # --- 1. 価格と画像URLの取得 (構造化データ JSON-LD) ---
        price_val = 0
        image_url = ""
        json_lds = soup.find_all("script", type="application/ld+json")
        for jld in json_lds:
            try:
                ld_data = json.loads(jld.string)
                if isinstance(ld_data, list): ld_data = ld_data[0]
                
                # 価格の抽出
                if not price_val:
                    price_val = ld_data.get("offers", {}).get("price", 0)
                
                # 画像URLの抽出
                if not image_url:
                    img = ld_data.get("image")
                    image_url = img[0] if isinstance(img, list) else img
            except: continue
        
        # --- 2. 画像URLの補完 (OGPタグ) ---
        if not image_url:
            og_img = soup.find("meta", property="og:image")
            if og_img:
                image_url = og_img.get("content")

        # --- 3. スペックテキストの抽出 ---
        spec_element = page.query_selector(".block-goods-detail")
        raw_text = spec_element.inner_text() if spec_element else soup.get_text()
        
        # --- 4. AI解析 (価格ヒント付き) ---
        ai_data = ask_ai_about_spec_lite(raw_text, web_price=price_val)
        
        # --- 5. 基本情報の補完 ---
        name_tag = soup.find("h1")
        web_name = name_tag.get_text(strip=True) if name_tag else "Unknown"
        
        # 最終的な価格の確定
        final_price = ai_data.get("price") or price_val

        return {
            "unique_id": f"mouse_{int(time.time())}_{url.split('/')[-1].replace('.html','')}",
            "name": ai_data.get("product_name") or web_name,
            "price": final_price,
            "image_url": image_url,
            "url": url,
            "ai_extracted_json": ai_data,
            "last_update": time.strftime("%Y-%m-%d %H:%M:%S")
        }
    except Exception as e:
        print(f"⚠️ Error during fetch: {e}")
        return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode', required=True)
    parser.add_argument('--limit', type=int, default=5)
    args = parser.parse_args()

    results = []
    with sync_playwright() as p:
        # ブラウザ起動（ヘッドレスモード）
        browser = p.chromium.launch(headless=True)
        # サイトに弾かれないようUser-Agentを設定
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        print(f"🔎 Listing products from: {BASE_SEARCH_URL}")
        page.goto(BASE_SEARCH_URL)
        page.wait_for_timeout(2000)
        
        # 商品詳細リンクの抽出
        links = page.query_selector_all('a[href*="/store/g/g"]')
        urls = []
        for l in links:
            href = l.get_attribute('href')
            if href:
                # パラメータやアンカー（#）を除去して正規化
                full_url = urllib.parse.urljoin("https://www.mouse-jp.co.jp", href).split('?')[0].split('#')[0]
                urls.append(full_url)
        
        # 重複排除してソート
        target_urls = sorted(list(set(urls)))
        print(f"Found {len(target_urls)} unique products.")

        # 指定件数分ループ
        for i, url in enumerate(target_urls[:int(args.limit)]):
            print(f"--- {i+1}/{args.limit} ---")
            data = fetch_detail_info(page, url)
            if data:
                results.append(data)
                # 途中で止まってもデータが残るよう1件ごとに保存
                with open(FINAL_FILE, "w", encoding="utf-8") as f:
                    json.dump(results, f, ensure_ascii=False, indent=4)
            
            # サーバーへの負荷軽減
            time.sleep(1)

        browser.close()
    print(f"\n✅ All tasks finished. Results saved to {FINAL_FILE}")

if __name__ == "__main__":
    main()