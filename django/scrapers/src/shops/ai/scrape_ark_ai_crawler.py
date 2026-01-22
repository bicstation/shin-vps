# -*- coding: utf-8 -*-
import os
import django
import re
import json
import time
import urllib.parse
import requests
import hashlib
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand

# --- Django設定 ---
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"

class Command(BaseCommand):
    help = 'アークの製品をPlaywrightとOllama AIで解析（デバッグ表示強化版）'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=100)

    def handle(self, *args, **options):
        OLLAMA_API_URL = "http://ollama-v2:11434/api/generate"
        REASONING_MODEL = "gemma3:4b"
        MAKER_NAME = "ark"
        SITE_PREFIX = "Ark"
        AFFILIATE_BASE_URL = "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3697471&pid=892466407&vc_url="

        from api.models.pc_products import PCProduct

        def call_ollama_simple(prompt):
            payload = {
                "model": REASONING_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.0, "num_predict": 1000}
            }
            try:
                print(f"🤖 AI Request (Model: {REASONING_MODEL})...")
                response = requests.post(OLLAMA_API_URL, json=payload, timeout=120)
                res_text = response.json().get("response", "").strip()
                print(f"--- [AI RAW RESPONSE] ---\n{res_text}\n-------------------------")
                return res_text
            except Exception as e:
                print(f"❌ Ollama Connection Error: {e}")
                return ""

        def ask_ai_about_spec_detailed(raw_text, web_price=None):
            clean_text = raw_text[:5000]
            prompt = f"""Extract technical specs as JSON.
STRICT RULES for 'npu_exists':
- Set TRUE ONLY IF: "Intel Core Ultra", "AMD Ryzen AI", or "Snapdragon X".
- Set FALSE FOR: "Intel Core i3/i5/i7/i9" (14th gen or older).
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
  "npu_exists": boolean
}}
"""
            raw_res = call_ollama_simple(prompt)
            try:
                match = re.search(r'\{.*\}', raw_res, re.DOTALL)
                if match:
                    extracted_data = json.loads(match.group(0))
                    if (not extracted_data.get("price")) and web_price:
                        extracted_data["price"] = web_price
                    return extracted_data
            except Exception as e:
                print(f"⚠️ AI Parse Error: {e}")
            return {"error": "parse_failed", "price": web_price}

        # --- 実行フェーズ ---
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(user_agent="Mozilla/5.0...")
            page = context.new_page()
            
            target_urls = []
            limit = options['limit']

            # 1. リンク収集
            self.stdout.write(self.style.HTTP_INFO("🔎 リンク収集を開始します..."))
            for offset in range(0, limit, 15):
                search_url = f"https://www.ark-pc.co.jp/search/?offset={offset}&key=ark"
                page.goto(search_url, wait_until="networkidle")
                
                links = page.query_selector_all('a[href*="/i/"]')
                found_on_page = 0
                for l in links:
                    href = l.get_attribute('href')
                    if href:
                        full_url = urllib.parse.urljoin("https://www.ark-pc.co.jp", href).split('?')[0]
                        if full_url not in target_urls:
                            target_urls.append(full_url)
                            found_on_page += 1
                
                print(f"📄 Offset {offset}: {found_on_page}件のリンクを発見 (合計: {len(target_urls)})")
                if len(target_urls) >= limit or found_on_page == 0: break

            # 2. 詳細解析 & DB保存
            self.stdout.write(self.style.HTTP_INFO(f"🚀 {len(target_urls)}件の詳細解析を開始します..."))
            for i, url in enumerate(target_urls[:limit]):
                print(f"\n🔄 [{i+1}/{len(target_urls)}] Accessing: {url}")
                try:
                    page.goto(url, wait_until="domcontentloaded")
                    soup = BeautifulSoup(page.content(), 'html.parser')
                    
                    # JSON-LD取得デバッグ
                    price_val = 0
                    image_url = ""
                    json_ld = soup.find("script", type="application/ld+json")
                    if json_ld:
                        try:
                            ld_data = json.loads(json_ld.string)
                            if isinstance(ld_data, list): ld_data = ld_data[0]
                            price_val = ld_data.get("offers", {}).get("price", 0)
                            img = ld_data.get("image")
                            image_url = img[0] if isinstance(img, list) else img
                            print(f"📝 JSON-LD Found: Price={price_val}, Image={image_url[:50]}...")
                        except:
                            print("⚠️ JSON-LD Parse Failed")

                    # AI解析実行
                    raw_text = page.inner_text("body")
                    ai_data = ask_ai_about_spec_detailed(raw_text, web_price=price_val)
                    
                    # 保存データの組み立て
                    uid = f"ark-ai-{hashlib.md5(url.encode()).hexdigest()[:12]}"
                    description = f"{ai_data.get('cpu')} / {ai_data.get('gpu')} / {ai_data.get('ram')} / NPU:{ai_data.get('npu_exists')}"
                    
                    save_payload = {
                        "unique_id": uid,
                        "name": ai_data.get("product_name") or soup.title.string,
                        "maker": MAKER_NAME,
                        "price": ai_data.get("price") or price_val,
                        "description": description,
                        "url": url,
                        "image_url": image_url,
                        "ai_raw": ai_data # デバッグ用
                    }

                    # コンソールに保存内容をすべて表示
                    print(f"✅ [SAVE DATA to DB]")
                    print(json.dumps(save_payload, ensure_ascii=False, indent=2))

                    # 実際のDB保存
                    PCProduct.objects.update_or_create(
                        unique_id=uid,
                        defaults={
                            'site_prefix': SITE_PREFIX,
                            'maker': MAKER_NAME,
                            'name': save_payload["name"],
                            'price': save_payload["price"],
                            'url': url,
                            'affiliate_url': f"{AFFILIATE_BASE_URL}{urllib.parse.quote(url, safe='')}",
                            'image_url': image_url,
                            'description': description,
                            'is_active': True,
                            'stock_status': "在庫あり",
                            'raw_genre': 'bto-pc',
                        }
                    )
                    time.sleep(1.0) # 連続アクセス制限

                except Exception as e:
                    print(f"❌ Error processing {url}: {e}")

            browser.close()
            self.stdout.write(self.style.SUCCESS(f"\n✨ 全タスク完了！"))