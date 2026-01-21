# -*- coding: utf-8 -*-
# 厳しスグリのであきらめます。
import os
import django
import sys
import re
import json
import time
import random
import urllib.parse
import requests
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# --- Django設定 ---
sys.path.append("/usr/src/app")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true" 
django.setup()
from api.models import BcLinkshareProduct

# --- 設定 ---
BASE_DIR = "/usr/src/app/scrapers/src"
SAVE_DIR = os.path.join(BASE_DIR, "json")
HTML_DIR = os.path.join(BASE_DIR, "html/asus")
DEBUG_DIR = os.path.join(BASE_DIR, "debug_asus")
PROMPT_FILE = os.path.join(BASE_DIR, "shops/ai/prompt/prompt_asus.txt")
OLLAMA_API_URL = "http://ollama-v2:11434/api/generate"
REASONING_MODEL = "gemma3:4b" 

os.makedirs(SAVE_DIR, exist_ok=True)
os.makedirs(HTML_DIR, exist_ok=True)
os.makedirs(DEBUG_DIR, exist_ok=True)

def load_prompt():
    if os.path.exists(PROMPT_FILE):
        with open(PROMPT_FILE, "r", encoding="utf-8") as f:
            return f.read().strip()
    return "Extract technical specs as JSON."

def call_ollama_simple(prompt):
    payload = {
        "model": REASONING_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.0, "num_predict": 1000}
    }
    try:
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=120)
        return response.json().get("response", "").strip()
    except:
        return ""

def fetch_detail_info(page, url, sku, api_price):
    try:
        clean_url = url.split('#')[0].split('?')[0]
        print(f"\n🚀 Accessing ASUS (Human Mode): {clean_url}")
        
        # 1. ページへ移動
        # Refererを設定して、公式サイト内を回遊しているように見せる
        page.goto(clean_url, wait_until="domcontentloaded", timeout=60000)
        
        # 2. 人間らしく待つ (3〜6秒のランダム)
        time.sleep(random.uniform(3.0, 6.0))

        # 3. 検知回避のための微スクロール
        page.mouse.wheel(0, random.randint(300, 700))
        page.wait_for_timeout(2000)

        # HTMLとスクショを保存 (この時点で拒否画面なら.pngでわかる)
        html_content = page.content()
        with open(os.path.join(HTML_DIR, f"{sku}.html"), "w", encoding="utf-8") as f:
            f.write(html_content)
        
        screenshot_path = os.path.join(DEBUG_DIR, f"{sku}.png")
        page.screenshot(path=screenshot_path, full_page=False)
        print(f"📸 Screenshot checked: {screenshot_path}")

        # もし拒否画面のテキストが含まれていたら中断
        if "unusual activity" in html_content or "Access Denied" in html_content:
            print(f"❌ BLOCKED by ASUS Security for SKU: {sku}")
            return None

        # --- AI解析 ---
        soup = BeautifulSoup(html_content, 'html.parser')
        main_element = page.query_selector("main") or page.query_selector("body")
        raw_text = main_element.inner_text() if main_element else ""

        instruction = load_prompt()
        prompt = f"{instruction}\n\nTEXT:\n{raw_text[:2500]}\n\nJSON:"
        ai_res = call_ollama_simple(prompt)
        print(f"   -> AI Response length: {len(ai_res)} chars")
        
        try:
            match = re.search(r'\{.*\}', ai_res, re.DOTALL)
            ai_data = json.loads(match.group(0)) if match else {"error": "no_json"}
        except:
            ai_data = {"error": "parse_failed", "raw": ai_res}

        final_data = {
            "sku": sku,
            "name": soup.find("h1").get_text(strip=True) if soup.find("h1") else sku,
            "price": api_price,
            "url": clean_url,
            "ai_extracted_json": ai_data,
            "last_update": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        return final_data

    except Exception as e:
        print(f"⚠️ Fetch Error ({sku}): {e}")
        return None

def main():
    raw_items = BcLinkshareProduct.objects.filter(mid="43708")
    with sync_playwright() as p:
        # headless=False にできる環境なら False を強く推奨
        # サーバー環境ならせめて args で検知回避
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox"
            ]
        )
        
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            viewport={'width': 1280, 'height': 1000},
            extra_http_headers={"Accept-Language": "ja,en-US;q=0.9,en;q=0.8"}
        )
        
        # WebDriverフラグを隠すためのスクリプト
        context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        page = context.new_page()

        for i, item in enumerate(raw_items):
            sku = item.api_response_json.get('sku')
            murl_match = re.search(r'murl=([^&]+)', item.api_response_json.get('linkurl'))
            if not murl_match: continue
            target_url = urllib.parse.unquote(murl_match.group(1))

            print(f"🔄 [{i+1}] Processing {sku}...")
            data = fetch_detail_info(page, target_url, sku, item.api_response_json.get('price', {}).get('value'))
            
            if data:
                with open(os.path.join(SAVE_DIR, f"asus_{sku}.json"), "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=4)
            
            # バレないように長めの休憩を入れる
            wait_time = random.randint(10, 20)
            print(f"💤 Sleeping for {wait_time}s to avoid detection...")
            time.sleep(wait_time)

        browser.close()

if __name__ == "__main__":
    main()