# -*- coding: utf-8 -*-
import re
import json
import time
import urllib.parse
import requests
import base64
import os
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# --- 設定 ---
OLLAMA_API_URL = "http://ollama-v2:11434/api/generate"
BASE_SEARCH_URL = "https://www.mouse-jp.co.jp/store/goods/search.aspx?search=x&limit=100"

# --- 保存ディレクトリの固定設定 ---
# 指定された絶対パスを使用
SAVE_DIR = "/home/maya/dev/shin-vps/django/scrapers/src/json"

# ディレクトリが存在しない場合は作成
if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR, exist_ok=True)

DEBUG_IMG_DIR = os.path.join(SAVE_DIR, "debug_screenshots")
BACKUP_FILE = os.path.join(SAVE_DIR, "mouse_backup.json")
FINAL_FILE = os.path.join(SAVE_DIR, "mouse_final_results.json")

os.makedirs(DEBUG_IMG_DIR, exist_ok=True)

def ask_ollama_about_spec(base64_image, raw_text_hint):
    """
    画像とテキストを組み合わせてLlavaに解析を依頼します。
    """
    try:
        prompt = f"""
        Extract PC hardware specifications. 
        Use the provided image and this text hint from the page:
        ---
        {raw_text_hint[:800]} 
        ---
        Respond ONLY in valid JSON format:
        {{"cpu": "...", "gpu": "...", "ram": "...", "storage": "...", "price": "..."}}
        - Use "Unknown" if not found.
        """
        payload = {
            "model": "llava",
            "prompt": prompt,
            "images": [base64_image],
            "stream": False,
            "options": {"temperature": 0.0}
        }
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=60)
        raw_res = response.json().get("response", "").strip()
        json_match = re.search(r'\{.*\}', raw_res, re.DOTALL)
        return json_match.group(0) if json_match else raw_res
    except Exception as e:
        return json.dumps({"error": str(e)})

def get_mouse_category(name, soup):
    name_up = name.upper()
    breadcrumb = soup.find("ul", id="bread-crumb-list")
    bc_text = breadcrumb.get_text() if breadcrumb else ""
    if any(x in bc_text or x in name_up for x in ["モニター", "ディスプレイ", "IIYAMA"]):
        return "monitor", "液晶モニター"
    if any(x in bc_text or x in name_up for x in ["ノート", "LAPTOP", "B4-", "F4-", "DAIV Z4"]):
        return "laptop", "ノートパソコン"
    return "desktop", "デスクトップパソコン"

def fetch_detail_info(page, url):
    """
    詳細ページからデータを抽出
    """
    try:
        page.goto(url, wait_until="networkidle", timeout=60000)
        # 画像読み込みのためにスクロール
        for _ in range(3):
            page.mouse.wheel(0, 800)
            time.sleep(0.5)

        soup = BeautifulSoup(page.content(), 'html.parser')
        
        # --- 画像URL抽出 (JSON-LD ＞ OGP ＞ HTML) ---
        image_url = ""
        json_lds = soup.find_all("script", type="application/ld+json")
        ld_data_final = {}
        for jld in json_lds:
            try:
                ld_data = json.loads(jld.string)
                if isinstance(ld_data, list): ld_data = ld_data[0]
                img = ld_data.get("image")
                if img:
                    image_url = img[0] if isinstance(img, list) else img
                    ld_data_final = ld_data
                    break
            except: continue
        
        if not image_url:
            og_img = soup.find("meta", property="og:image")
            if og_img: image_url = og_img.get("content")
            
        if not image_url:
            img_tag = soup.select_one(".goods-image-main img") or soup.select_one("#main_image")
            if img_tag:
                image_url = img_tag.get("src") or img_tag.get("data-src")

        if image_url:
            image_url = urllib.parse.urljoin(url, image_url)
            if "spacer.gif" in image_url: image_url = ""

        # スペック要素
        spec_selector = ".block-goods-detail"
        raw_text_hint = ""
        try:
            page.wait_for_selector(spec_selector, timeout=5000)
            target_el = page.query_selector(spec_selector)
            if target_el:
                raw_text_hint = target_el.inner_text()
        except:
            target_el = None

        # スクショ
        product_id = url.split('/')[-1] or str(int(time.time()))
        img_path = os.path.join(DEBUG_IMG_DIR, f"{product_id}.png")
        if target_el: target_el.screenshot(path=img_path)
        else: page.screenshot(path=img_path)
        
        with open(img_path, "rb") as f:
            img_base64 = base64.b64encode(f.read()).decode('utf-8')

        ai_json_str = ask_ollama_about_spec(img_base64, raw_text_hint)
        name = soup.find("h1").get_text(strip=True) if soup.find("h1") else "Unknown"
        
        price_raw = 0
        if ld_data_final:
            try: price_raw = ld_data_final.get("offers", {}).get("price", 0)
            except: pass

        unified_genre, raw_genre = get_mouse_category(name, soup)

        return {
            "unique_id": f"mouse_{product_id}",
            "site_prefix": "mouse",
            "maker": "Mouse Computer",
            "name": name,
            "price": int(str(price_raw).replace(',', '')) if price_raw else 0,
            "url": url,
            "image_url": image_url,
            "raw_genre": raw_genre,
            "unified_genre": unified_genre,
            "description": raw_text_hint,
            "ai_extracted_json": ai_json_str,
            "stock_status": "在庫あり"
        }
    except Exception as e:
        print(f"\n   ⚠️ 解析失敗: {url} | {e}")
        return None

def run_mouse_full_scan():
    print("\n" + "="*80)
    print("🚀 [Mouse Computer] Django統合・パス固定モード")
    print(f"📂 保存先ディレクトリ: {SAVE_DIR}")
    print("="*80 + "\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        target_urls = []
        offset = 0
        while len(target_urls) < 100:
            print(f"🔗 リスト取得中... ({len(target_urls)}件確保)", end="\r")
            try:
                page.goto(f"{BASE_SEARCH_URL}&o={offset}", wait_until="domcontentloaded")
                soup = BeautifulSoup(page.content(), 'html.parser')
                links = soup.find_all('a', href=re.compile(r'/store/g/g'))
                if not links: break
                new_links = [urllib.parse.urljoin("https://www.mouse-jp.co.jp", l.get('href')).split('?')[0] for l in links]
                unique_new = [l for l in new_links if l not in target_urls]
                if not unique_new: break
                target_urls.extend(unique_new)
                offset += 100
            except:
                break

        results = []
        for i, url in enumerate(target_urls):
            current_idx = i + 1
            print(f"[{current_idx:03}/{len(target_urls):03}] 🏁 解析開始: {url}")
            
            data = fetch_detail_info(page, url)
            
            if data:
                img_st = data['image_url'] if data['image_url'] else "❌ 取得失敗"
                print(f"   🖼️  画像URL : {img_st}")
                print(f"   💰 価格    : {data['price']:,} 円")
                print(f"   🤖 AI解析   : {data['ai_extracted_json']}")
                print("-" * 70)
                results.append(data)

            # 5件ごとに中間保存
            if current_idx % 5 == 0:
                with open(BACKUP_FILE, "w", encoding="utf-8") as f:
                    json.dump(results, f, ensure_ascii=False, indent=4)
                print(f"   💾 中間保存完了: {os.path.basename(BACKUP_FILE)}")

        # 最終保存
        with open(FINAL_FILE, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=4)
        
        print("\n" + "="*80)
        print(f"🎉 完了！ 全 {len(results)} 件のデータを保存しました。")
        print(f"📄 最終ファイル: {FINAL_FILE}")
        print(f"📸 スクリーンショット: {DEBUG_IMG_DIR}")
        print("="*80 + "\n")
        browser.close()

if __name__ == "__main__":
    run_mouse_full_scan()