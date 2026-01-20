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

# メモリ6GBのRTX 3050に最適なモデル
REASONING_MODEL = "gemma3:4b" 

os.makedirs(SAVE_DIR, exist_ok=True)

def call_ollama_simple(prompt):
    """ Ollama APIを呼び出してテキストを生成する """
    payload = {
        "model": REASONING_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.0, "num_predict": 1000}
    }
    try:
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=120)
        res_json = response.json()
        return res_json.get("response", "").strip()
    except Exception as e:
        print(f"❌ Ollama Connection Error: {e}")
        return ""

def ask_ai_about_spec_detailed(raw_text, web_price=None):
    """ ジャンル、NPU、スペックを厳格に抽出する """
    clean_text = raw_text[:5000]
    price_hint = f"REFERENCE PRICE: {web_price} JPY" if web_price else "REFERENCE PRICE: Unknown"

    # NPU判定の基準を極めて具体的に指示（誤判定防止）
    prompt = f"""Extract technical specs as JSON.
{price_hint}

STRICT RULES for 'npu_exists':
- Set TRUE ONLY IF: "Intel Core Ultra", "AMD Ryzen AI" (brand name), or "Snapdragon X".
- Set FALSE FOR: 
  - All "Intel Core i3/i5/i7/i9" (13th, 14th gen or older). 
  - Standard Ryzen 7000/5000 (unless 'Ryzen AI' is explicitly mentioned).
  - Example: "Core i7-13620H" and "Core i5-1335U" are FALSE.

STRICT RULES for Genre & Lists:
- genre: "ノートブック", "デスクトップ", or "モニター".
- If "モニター", set CPU/GPU/RAM/Storage to null.
- RETURN ONLY ONE JSON OBJECT. NO LISTS [].

TEXT:
{clean_text}

JSON TEMPLATE:
{{
  "product_name": "string",
  "genre": "ノートブック" | "デスクトップ" | "モニター",
  "price": number,
  "cpu": "string or null",
  "gpu": "string or null",
  "ram": "string or null",
  "storage": "string or null",
  "screen_size": "string or null",
  "weight": "string or null",
  "npu_exists": boolean
}}
"""
    raw_res = call_ollama_simple(prompt)
    
    try:
        match = re.search(r'\{.*\}', raw_res, re.DOTALL)
        if match:
            extracted_data = json.loads(match.group(0))
            if isinstance(extracted_data, list):
                extracted_data = extracted_data[0]
            
            # 価格の補完
            if (extracted_data.get("price") is None or extracted_data.get("price") == 0) and web_price:
                extracted_data["price"] = web_price
            
            # 安全策: モニターならNPUは必ずFalse
            if extracted_data.get("genre") == "モニター":
                extracted_data["npu_exists"] = False

            return extracted_data
    except Exception as e:
        print(f"⚠️ AI Parse Error: {e}")
    
    return {"error": "parse_failed", "raw": raw_res, "price": web_price}

def fetch_detail_info(page, url):
    try:
        clean_url = url.split('#')[0].split('?')[0]
        print(f"\n🚀 Accessing: {clean_url}")
        
        page.goto(clean_url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(2000)
        
        soup = BeautifulSoup(page.content(), 'html.parser')
        
        # --- 価格と画像取得 ---
        price_val = 0
        image_url = ""
        json_lds = soup.find_all("script", type="application/ld+json")
        for jld in json_lds:
            try:
                ld_data = json.loads(jld.string)
                if isinstance(ld_data, list): ld_data = ld_data[0]
                price_val = price_val or ld_data.get("offers", {}).get("price", 0)
                if not image_url:
                    img = ld_data.get("image")
                    image_url = img[0] if isinstance(img, list) else img
            except: continue
        
        if not image_url:
            og_img = soup.find("meta", property="og:image")
            if og_img: image_url = og_img.get("content")

        # --- AIスペック解析 ---
        spec_element = page.query_selector("body")
        raw_text = spec_element.inner_text() if spec_element else soup.get_text()
        ai_data = ask_ai_about_spec_detailed(raw_text, web_price=price_val)
        
        # --- 保存用データの組み立て ---
        name_tag = soup.find("h1")
        web_name = name_tag.get_text(strip=True) if name_tag else "Unknown"

        final_data = {
            "unique_id": f"mouse_{clean_url.rstrip('/').split('/')[-1]}",
            "name": ai_data.get("product_name") or web_name,
            "genre": ai_data.get("genre"),
            "price": ai_data.get("price") or price_val,
            "image_url": image_url,
            "url": clean_url,
            "ai_extracted_json": ai_data,
            "last_update": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        # コンソールに保存内容をすべて表示
        print(f"--- [SAVE DATA] ---")
        print(json.dumps(final_data, ensure_ascii=False, indent=2))
        print(f"-------------------\n")

        return final_data

    except Exception as e:
        print(f"⚠️ Fetch Error: {e}")
        return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode', required=True)
    parser.add_argument('--limit', type=int, default=300)
    args = parser.parse_args()

    results = []
    target_urls = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        # 1. リンク収集
        for offset in range(0, args.limit + 100, 100):
            search_url = f"https://www.mouse-jp.co.jp/store/goods/search.aspx?search=x&limit=100&o={offset}"
            print(f"🔎 Scanning list page (Offset: {offset})...")
            try:
                page.goto(search_url, wait_until="networkidle")
                page.wait_for_timeout(2000)
                
                links = page.query_selector_all('a[href*="/store/g/g"]')
                found_on_page = 0
                for l in links:
                    href = l.get_attribute('href')
                    if href:
                        full_url = urllib.parse.urljoin("https://www.mouse-jp.co.jp", href).split('?')[0].split('#')[0]
                        if "/store/g/g" in full_url and full_url not in target_urls:
                            target_urls.append(full_url)
                            found_on_page += 1
                
                if found_on_page == 0 or len(target_urls) >= args.limit:
                    break
            except:
                break
        
        target_urls = target_urls[:args.limit]
        print(f"✅ Found {len(target_urls)} items. Starting detailed analysis...")

        # 2. 詳細解析ループ
        for i, url in enumerate(target_urls):
            print(f"🔄 Processing {i+1}/{len(target_urls)}")
            data = fetch_detail_info(page, url)
            if data:
                results.append(data)
                # 逐次保存
                with open(FINAL_FILE, "w", encoding="utf-8") as f:
                    json.dump(results, f, ensure_ascii=False, indent=4)
            
            time.sleep(1.2)

        browser.close()
    
    print(f"\n✅ All tasks finished. Total {len(results)} items saved to {FINAL_FILE}")

if __name__ == "__main__":
    main()