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
    help = 'アークの製品をPlaywrightとOllama AIで解析し、JSON出力とDB保存を行うフルスクリプト'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=100)

    def handle(self, *args, **options):
        # --- 設定 ---
        OLLAMA_API_URL = "http://ollama-v2:11434/api/generate"
        REASONING_MODEL = "gemma3:4b"
        MAKER_NAME = "ark"
        SITE_PREFIX = "Ark"
        # 提供された最新のアフィリエイトベースURL (sid=3697471, pid=892466351)
        AFFILIATE_BASE_URL = "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3697471&pid=892466351&vc_url="
        
        # --- 【修正】Dockerコンテナ内のパスに変更 ---
        # docker-compose.yml で ./django が /usr/src/app にマウントされているため
        # このパスに書き込むことでホスト側の django/scrapers/src/json/ に反映されます
        JSON_OUTPUT_FILE = "/usr/src/app/scrapers/src/json/ark_results.json"
        
        # 出力ディレクトリが存在しない場合は作成
        output_dir = os.path.dirname(JSON_OUTPUT_FILE)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir, mode=0o775, exist_ok=True)
        
        from api.models.pc_products import PCProduct

        results_list = [] # JSON保存用のリスト

        def call_ollama_simple(prompt):
            """ Ollama APIを呼び出し、レスポンスを返す """
            payload = {
                "model": REASONING_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.0, "num_predict": 1000}
            }
            try:
                print(f"🤖 AI Requesting ({REASONING_MODEL})...")
                response = requests.post(OLLAMA_API_URL, json=payload, timeout=120)
                if response.status_code != 200:
                    print(f"❌ API Error: {response.status_code}")
                    return ""
                res_text = response.json().get("response", "").strip()
                print(f"--- [AI RAW RESPONSE] ---\n{res_text}\n-------------------------")
                return res_text
            except Exception as e:
                print(f"❌ Ollama Connection Error: {e}")
                return ""

        def ask_ai_about_spec_detailed(raw_text, web_price=None):
            """ スペック表のテキストからJSONデータを抽出する """
            clean_text = raw_text[:4000] # 文字数制限対策
            prompt = f"""Extract technical specs as JSON.
STRICT RULES for 'npu_exists':
- Set TRUE ONLY IF: "Intel Core Ultra", "AMD Ryzen AI", or "Snapdragon X".
- Set FALSE FOR: "Intel Core i3/i5/i7/i9" (14th gen or older).
TEXT:
{clean_text}
JSON TEMPLATE:
{{
  "product_name": "string",
  "genre": "ノートブック" | "デスクトップ" | "モニター" | "パーツ",
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
                # JSON部分のみを抽出
                match = re.search(r'\{.*\}', raw_res, re.DOTALL)
                if match:
                    data = json.loads(match.group(0))
                    # 価格補完
                    if (not data.get("price")) and web_price:
                        data["price"] = web_price
                    return data
            except Exception as e:
                print(f"⚠️ AI Parse Error: {e}")
            return {"error": "parse_failed", "price": web_price}

        # --- 実行フェーズ ---
        with sync_playwright() as p:
            print("🚀 Playwrightを起動中...")
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            
            target_urls = []
            limit = options['limit']

            # 1. リンク収集
            self.stdout.write(self.style.HTTP_INFO("🔎 ターゲットURLを収集中..."))
            for offset in range(0, limit + 50, 50):
                search_url = f"https://www.ark-pc.co.jp/search/?key=ark&limit=50&offset={offset}"
                try:
                    page.goto(search_url, wait_until="networkidle", timeout=60000)
                    links = page.query_selector_all('a[href*="/i/"]')
                    found_before = len(target_urls)
                    for l in links:
                        href = l.get_attribute('href')
                        if href:
                            full_url = urllib.parse.urljoin("https://www.ark-pc.co.jp", href).split('?')[0]
                            if full_url not in target_urls:
                                target_urls.append(full_url)
                    
                    print(f"📄 Offset {offset}: {len(target_urls) - found_before}件新規発見")
                    if len(target_urls) >= limit or (len(target_urls) - found_before) == 0:
                        break
                except:
                    break

            target_urls = target_urls[:limit]

            # 2. 詳細解析 & 保存
            self.stdout.write(self.style.HTTP_INFO(f"🚀 {len(target_urls)}件の解析を開始します..."))
            for i, url in enumerate(target_urls):
                print(f"🔄 [{i+1}/{len(target_urls)}] Accessing: {url}")
                try:
                    # 画像などのリソース読み込みを待つため networkidle を使用
                    page.goto(url, wait_until="networkidle", timeout=60000)
                    soup = BeautifulSoup(page.content(), 'html.parser')

                    # --- ① 価格の抽出 ---
                    price_val = 0
                    price_tag = soup.select_one('.item_price, .total_price, .price, #item_price_area')
                    if price_tag:
                        price_digits = re.sub(r'\D', '', price_tag.get_text())
                        price_val = int(price_digits) if price_digits else 0
                    
                    # --- ② 画像の抽出 (強化版) ---
                    image_url = ""
                    # 複数の候補セレクタでチェック
                    img_selectors = [
                        '#item_main_image img', 
                        '#main_image_container img',
                        '.item_photo img', 
                        '.product-image img',
                        'img[src*="/images/item/"]' # アークの画像パスの特徴
                    ]
                    
                    for selector in img_selectors:
                        img_tag = soup.select_one(selector)
                        if img_tag:
                            # 優先順位: data-src (遅延読み込み) > src
                            src = img_tag.get('data-src') or img_tag.get('src')
                            if src and 'spacer.gif' not in src:
                                image_url = urllib.parse.urljoin("https://www.ark-pc.co.jp", src)
                                break

                    # JSON-LDからの補完 (画像がHTMLから取れなかった場合)
                    if not image_url:
                        json_ld_tags = soup.find_all("script", type="application/ld+json")
                        for tag in json_ld_tags:
                            try:
                                ld = json.loads(tag.string)
                                if isinstance(ld, list): ld = ld[0]
                                if "image" in ld:
                                    img_field = ld["image"]
                                    image_url = img_field[0] if isinstance(img_field, list) else img_field
                                    break
                            except: pass

                    # --- ③ AI解析 ---
                    spec_element = soup.select_one('.spec_table, .item_spec_table, #item_spec_area')
                    raw_text = spec_element.get_text("\n") if spec_element else page.inner_text("body")
                    
                    ai_data = ask_ai_about_spec_detailed(raw_text, web_price=price_val)
                    
                    # --- ④ データの組み立て ---
                    uid = f"ark-ai-{hashlib.md5(url.encode()).hexdigest()[:12]}"
                    
                    cpu = ai_data.get('cpu') or 'N/A'
                    gpu = ai_data.get('gpu') or 'N/A'
                    ram = ai_data.get('ram') or 'N/A'
                    storage = ai_data.get('storage') or 'N/A'
                    npu = ai_data.get('npu_exists', False)

                    description = f"{cpu} / {gpu} / {ram} / {storage} / NPU:{npu}"

                    save_data = {
                        "unique_id": uid,
                        "name": ai_data.get("product_name") or soup.title.string,
                        "maker": MAKER_NAME,
                        "price": ai_data.get("price") or price_val,
                        "description": description,
                        "url": url,
                        "image_url": image_url,
                        "genre": ai_data.get("genre", "不明"),
                        "last_update": time.strftime("%Y-%m-%d %H:%M:%S")
                    }

                    # コンソール出力
                    img_status = "✅ Found" if image_url else "❌ Not Found"
                    print(f"📊 [DATA] {save_data['name'][:30]} | Image: {img_status}")

                    # DB更新
                    PCProduct.objects.update_or_create(
                        unique_id=uid,
                        defaults={
                            'site_prefix': SITE_PREFIX,
                            'maker': MAKER_NAME,
                            'name': save_data["name"],
                            'price': save_data["price"],
                            'url': url,
                            'affiliate_url': f"{AFFILIATE_BASE_URL}{urllib.parse.quote(url, safe='')}",
                            'image_url': image_url,
                            'description': description,
                            'is_active': True,
                            'stock_status': "在庫あり",
                            'raw_genre': 'bto-pc',
                        }
                    )

                    # JSONファイル更新
                    results_list.append(save_data)
                    with open(JSON_OUTPUT_FILE, "w", encoding="utf-8") as f:
                        json.dump(results_list, f, ensure_ascii=False, indent=4)

                    time.sleep(1.0)

                except Exception as e:
                    print(f"❌ Error in {url}: {e}")

            browser.close()
            self.stdout.write(self.style.SUCCESS(f"\n✨ アーク製品のスクレイピングが完了しました！"))