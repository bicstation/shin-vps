import os
import django
import re
import hashlib
import time
import random
import json
import urllib.parse
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# --- Django設定 ---
# 環境に合わせた初期化
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models.pc_products import PCProduct

# ==========================================
# 🔑 1. 設定情報 (GEEKOM 日本公式 & A8.net)
# ==========================================
# A8.net のベースURL
A8_BASE_URL = "https://px.a8.net/svt/ejp?a8mat=459XR1+CCSU76+5G4A+BW0YB&a8ejpredirect="
MAKER_NAME = "GEEKOM"
BASE_DOMAIN = "geekom.jp"

# 💡 解析結果に基づいたターゲットURLリスト
TARGET_COLLECTIONS = [
    "https://geekom.jp/collections/intel",
    "https://geekom.jp/collections/amd-ryzen",
    "https://geekom.jp/pages/game-minipc",
    "https://geekom.jp/pages/office-minipc"
]

# ==========================================
# 🛠️ 2. 解析エンジン
# ==========================================

def extract_detailed_specs(soup, product_name):
    """
    HTMLテキスト全体から CPU / GPU / RAM / SSD を正規表現で抽出
    """
    full_text = soup.get_text()
    desc_meta = soup.select_one('meta[name="description"]')
    meta_text = desc_meta['content'] if desc_meta else ""
    # メタ情報と本文を統合して検索対象にする
    search_target = f"{product_name} {meta_text} {full_text}"

    specs = []

    # 1. CPU (Core Ultra, i9/i7/i5, Ryzen 9/7/5 等)
    cpu_pattern = r'((?:AMD\s?)?Ryzen™?\s?\d\s\d{4}[A-Z]{1,2}|(?:Intel\s?)?Core™?\s?i\d-\d+[A-Z]?|(?:Intel\s?)?Ultra\s?\d\s\d{3}[A-Z]?)'
    cpu_match = re.search(cpu_pattern, search_target, re.I)
    specs.append(cpu_match.group(1).replace('™', '').strip() if cpu_match else "CPU未確認")

    # 2. GPU (RTX 4060, Radeon 780M, Iris Xe 等)
    gpu_pattern = r'(RTX\s?\d{4}(?:\s?Ti)?|Radeon\s?\d{2,3}[A-Z]?|Iris\s?Xe|Intel\s?Graphics)'
    gpu_match = re.search(gpu_pattern, search_target, re.I)
    if gpu_match:
        specs.append(gpu_match.group(1).strip())
    elif "Mega Mini G1" in product_name:
        specs.append("RTX 4060")
    else:
        specs.append("内蔵グラフィックス")

    # 3. メモリ(RAM)
    ram_pattern = r'(\d{1,3}GB\s?(?:DDR\d|LPDDR\d|RAM))'
    ram_match = re.search(ram_pattern, search_target, re.I)
    specs.append(ram_match.group(1).strip() if ram_match else "RAM未確認")

    # 4. ストレージ(SSD)
    ssd_pattern = r'(\d{1,3}(?:GB|TB)\s?(?:SSD|NVMe|PCIe))'
    ssd_match = re.search(ssd_pattern, search_target, re.I)
    specs.append(ssd_match.group(1).strip() if ssd_match else "SSD未確認")

    return " / ".join(specs)

def extract_correct_price(soup, product_data):
    """
    Shopify特有のクラス名および構造化データから正確な販売価格を抽出
    """
    price_selectors = [
        '.price-item--sale',                # セール価格優先
        '.price__last .price-item',        # 通常価格
        '.product__price .price-item--sale',
        '.current-price'
    ]
    
    for selector in price_selectors:
        tag = soup.select_one(selector)
        if tag:
            digits = re.sub(r'[^\d]', '', tag.get_text())
            if digits and int(digits) > 1000:
                return int(digits)

    # 構造化データ(JSON-LD)からのフォールバック
    offers = product_data.get('offers', {})
    if isinstance(offers, list): offers = offers[0]
    try:
        raw_price = int(float(offers.get('price', 0)))
        return raw_price if raw_price > 1000 else 0
    except:
        return 0

def scrape_geekom_page(page, url, current_index, total_count):
    """個別商品ページの解析とDjangoへの保存"""
    url_clean = url.split('?')[0].split('#')[0].rstrip('/')
    print(f"🔎 [{current_index + 1}/{total_count}] 解析中: {url_clean}")
    
    try:
        page.goto(url_clean, wait_until="domcontentloaded", timeout=60000)
        # スクロールして動的コンテンツ（画像や価格）をトリガー
        page.evaluate("window.scrollTo(0, 500)")
        page.wait_for_timeout(2000) 
        
        soup = BeautifulSoup(page.content(), 'html.parser')
        
        # 構造化データの取得
        product_data = {}
        scripts = soup.find_all('script', type='application/ld+json')
        for script in scripts:
            try:
                data = json.loads(script.string)
                items = data if isinstance(data, list) else [data]
                for item in items:
                    if isinstance(item, dict) and item.get('@type') == 'Product':
                        product_data = item
                        break
            except: continue

        # 製品名取得
        name = product_data.get('name') or (soup.select_one('h1').get_text().strip() if soup.select_one('h1') else "不明な製品")
        
        # 除外キーワード（アクセサリや保証ページを飛ばす）
        if any(word in name for word in ["送料", "クーポン", "保証", "保険", "ギフトカード"]):
            print(f" ⏩ スキップ: {name}")
            return False

        # 価格取得
        price = extract_correct_price(soup, product_data)
        
        # 画像URL取得
        meta_img = soup.select_one('meta[property="og:image"]')
        image_url = meta_img.get('content') if meta_img else ""
        if image_url.startswith('//'): image_url = "https:" + image_url

        # スペック抽出
        description = extract_detailed_specs(soup, name)
        
        # 🔗 A8.net アフィリエイトURL生成
        encoded_prod_url = urllib.parse.quote(url_clean, safe='')
        final_affiliate_url = f"{A8_BASE_URL}{encoded_prod_url}"

        # 在庫判定
        offers = product_data.get('offers', {})
        if isinstance(offers, list): offers = offers[0]
        availability = offers.get('availability', '') if isinstance(offers, dict) else ""
        stock_status = '在庫あり' if "InStock" in availability and price > 0 else '在庫切れ・予約受付中'

        # Django保存処理
        unique_id = "geekom-" + hashlib.md5(url_clean.encode()).hexdigest()[:12]
        PCProduct.objects.update_or_create(
            unique_id=unique_id,
            defaults={
                'site_prefix': 'GEEKOM',
                'maker': MAKER_NAME,
                'name': name,
                'price': price,
                'url': url_clean,
                'affiliate_url': final_affiliate_url,
                'image_url': image_url,
                'description': description,
                'is_active': True,
                'stock_status': stock_status,
                'raw_genre': 'mini-pc',
                'unified_genre': 'mini-pc',
            }
        )
        print(f"   ✅ 保存完了: {name} (¥{price:,})")
        return True

    except Exception as e:
        print(f"   ❌ 解析失敗: {e}")
        return False

# ==========================================
# 🚀 3. メインクローラー
# ==========================================

def run_geekom_crawler():
    """全指定URLの巡回実行"""
    with sync_playwright() as p:
        # ブラウザ起動（高速化のため画像読み込みをオフにする設定も可能だが、今回は確実性重視）
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        all_product_urls = set()

        print(f"📂 GEEKOM 全カテゴリ巡回開始...")
        
        for list_url in TARGET_COLLECTIONS:
            print(f"🌐 巡回中: {list_url}")
            try:
                page.goto(list_url, wait_until="networkidle", timeout=60000)
                # ページ内のすべてのaタグから /products/ を含み、コレクションページではないものを抽出
                hrefs = page.evaluate('''() => {
                    return Array.from(document.querySelectorAll('a'))
                                .map(a => a.href)
                                .filter(href => href.includes('/products/') && !href.includes('/collections/'));
                }''')
                
                for h in hrefs:
                    # クリーンアップ（クエリ削除）してセットに追加（重複自動排除）
                    clean_h = h.split('?')[0].split('#')[0].rstrip('/')
                    all_product_urls.add(clean_h)
                    
            except Exception as e:
                print(f"   ⚠️ ページ取得失敗: {e}")

        # 解析対象の確定
        product_urls = sorted(list(all_product_urls))
        print(f"📊 解析対象製品数: {len(product_urls)}件")

        # 個別ページ解析ループ
        for i, url in enumerate(product_urls):
            scrape_geekom_page(page, url, i, len(product_urls))
            # サーバーへの負荷を考慮したランダム待機
            time.sleep(random.uniform(2.0, 4.0))

        browser.close()
        print(f"\n✨ GEEKOM 全製品データの同期が完了しました。")

if __name__ == "__main__":
    run_geekom_crawler()