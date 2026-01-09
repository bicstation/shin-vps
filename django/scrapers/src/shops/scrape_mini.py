import os
import django
import re
import hashlib
import time
import random
import json
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# --- Django設定 ---
# Dockerコンテナ内での実行を想定し、Django環境を初期化
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import PCProduct

# ==========================================
# 🔑 1. 設定情報
# ==========================================
AFFILIATE_ID = "389"
MAKER_NAME = "MINISFORUM"
BASE_DOMAIN = "www.minisforum.jp"

# ==========================================
# 🛠️ 2. 解析エンジン
# ==========================================

def extract_detailed_specs(soup, product_name):
    """
    タイトル、メタデータ、およびページ内テキストから
    CPU / GPU / RAM / SSD を抽出してスラッシュ区切りで返す
    """
    full_text = soup.get_text()
    desc_meta = soup.select_one('meta[name="description"]')
    meta_text = desc_meta['content'] if desc_meta else ""
    search_target = f"{product_name} {meta_text} {full_text}"

    specs = []

    # 1. CPU抽出
    cpu_pattern = r'((?:AMD\s?)?Ryzen™?\s?\d\s\d{4}[A-Z]{1,2}|(?:Intel\s?)?Core™?\s?i\d-\d+[A-Z]?|(?:Intel\s?)?Ultra\s?\d\s\d{3}[A-Z]?)'
    cpu_match = re.search(cpu_pattern, search_target, re.I)
    if cpu_match:
        specs.append(cpu_match.group(1).replace('™', '').strip())
    else:
        specs.append("CPU未確認")

    # 2. GPU抽出
    gpu_pattern = r'(RTX\s?\d{4}(?:\s?Ti)?|Radeon\s?\d{2,3}[A-Z]?)'
    gpu_match = re.search(gpu_pattern, search_target, re.I)
    if gpu_match:
        specs.append(gpu_match.group(1).strip())
    elif "G1" in product_name or "ゲーミング" in search_target:
        specs.append("外部GPU対応可")

    # 3. メモリ(RAM)抽出
    ram_pattern = r'(\d{1,3}GB\s?(?:DDR\d|LPDDR\d|統合メモリ|RAM))'
    ram_match = re.search(ram_pattern, search_target, re.I)
    if ram_match:
        specs.append(ram_match.group(1).strip())

    # 4. ストレージ(SSD)抽出
    ssd_pattern = r'(\d{1,3}(?:GB|TB)\s?(?:SSD|NVMe|PCIe|ストレージ))'
    ssd_match = re.search(ssd_pattern, search_target, re.I)
    if ssd_match:
        specs.append(ssd_match.group(1).strip())

    return " / ".join(specs)

def extract_correct_price(soup, product_data):
    """HTML上の日本円表記を優先して抽出"""
    price_selectors = [
        '.price-item--sale', 
        '.price-item--regular', 
        'sale-price', 
        '.product-form__price',
        '.price__last .price-item'
    ]
    
    for selector in price_selectors:
        tag = soup.select_one(selector)
        if tag:
            digits = re.sub(r'[^\d]', '', tag.get_text())
            if digits and int(digits) > 1000:
                return int(digits)

    offers = product_data.get('offers', {})
    if isinstance(offers, list): offers = offers[0]
    raw_price = int(float(offers.get('price', 0)))
    return raw_price if raw_price > 1000 else 0

def extract_best_image(soup, product_data):
    """
    【重要修正】
    画像URLを抽出し、ドメイン欠落を防ぎつつ、
    正しい Shopify CDN パス（https://www.minisforum.jp/cdn/shop/files/...）を生成する
    """
    img = product_data.get('image')
    img_url = img[0] if isinstance(img, list) and img else img
    
    if not img_url:
        meta_img = soup.select_one('meta[property="og:image"]')
        if meta_img:
            img_url = meta_img.get('content')

    if not img_url:
        selectors = ['.product__media img', '.product-gallery__image', '.product-main-image', '[data-zoom]']
        for s in selectors:
            target = soup.select_one(s)
            if target:
                img_url = target.get('src') or target.get('data-src') or target.get('srcset')
                if img_url: break

    if not img_url:
        return ""

    # --- 画像URLの補正ロジック (強化版) ---
    
    # 1. // から始まるプロトコル相対パス
    if img_url.startswith('//'):
        img_url = "https:" + img_url
    
    # 2. ユーザー指摘の「files/」で始まるパス、またはドメイン欠落状態の補正
    elif "files/" in img_url and "cdn/shop" not in img_url:
        # files/ 以降をすべて抽出して、正しいCDNドメインと結合
        path_part = img_url.split('files/')[-1]
        img_url = f"https://{BASE_DOMAIN}/cdn/shop/files/{path_part}"
    
    # 3. 通常のドメイン内相対パス
    elif img_url.startswith('/') and not img_url.startswith('//'):
        img_url = f"https://{BASE_DOMAIN}{img_url}"
    
    # URLからクエリパラメータ（?v=... 等）を除去
    img_url = img_url.split('?')[0]
    
    return img_url

def generate_affiliate_html(url, name):
    """Minisforum公式サイト用のアフィリエイトリンクHTML生成"""
    clean_url = url.split('?')[0].rstrip('/')
    aff_url = f"{clean_url}?aff={AFFILIATE_ID}"
    
    html = f'<div class="affiliate-link-container" style="margin: 20px 0; text-align: center;">'
    html += f'<a href="{aff_url}" target="_blank" rel="nofollow noopener" class="affiliate-button" '
    html += f'style="display:inline-block;background:#004bb1;color:#fff;padding:12px 25px;text-decoration:none;border-radius:30px;font-weight:bold;box-shadow:0 4px 6px rgba(0,0,0,0.1);">'
    html += f'<span>{name} を公式サイトで詳細を見る</span>'
    html += '</a></div>'
    return html

def scrape_minis_page(page, url, current_index, total_count):
    url_clean = url.split('?')[0].split('#')[0].rstrip('/')
    
    print(f"🔎 [{current_index + 1}/{total_count}] 解析中: {url_clean}")
    
    try:
        page.goto(url_clean, wait_until="domcontentloaded", timeout=60000)
        page.evaluate("window.scrollTo(0, 500)")
        page.wait_for_timeout(2000) 
        
        html_content = page.content()
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # JSON-LD (構造化データ) の読み込み
        product_data = {}
        scripts = soup.find_all('script', type='application/ld+json')
        for script in scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and data.get('@type') == 'Product':
                    product_data = data
                    break
            except: continue

        # 1. 製品名
        name = product_data.get('name') or (soup.select_one('h1').get_text().strip() if soup.select_one('h1') else "不明な製品")
        
        # 除外キーワード
        blacklist = ["配送保護", "保険", "サービス", "延長保証", "クーポン", "送料"]
        if any(word in name for word in blacklist):
            print(f" ⏩ スキップ: {name}")
            return False

        # 2. ジャンル判定 (修正: desktop を mini-pc または motherboard に適正化)
        if "マザーボード" in name or "Motherboard" in name or "BD790i" in name or "BD770i" in name:
            raw_genre = "motherboard"
            unified_genre = "motherboard"
        else:
            raw_genre = "mini-pc"
            unified_genre = "mini-pc"

        # 3. 価格 / 画像 / スペック
        price = extract_correct_price(soup, product_data)
        image_url = extract_best_image(soup, product_data)
        description = extract_detailed_specs(soup, name)
        affiliate_url = f"{url_clean}?aff={AFFILIATE_ID}"
        affiliate_link_html = generate_affiliate_html(url_clean, name)

        # 4. 在庫ステータス判定
        offers = product_data.get('offers', {})
        if isinstance(offers, list): offers = offers[0]
        is_instock = offers.get('availability') == 'http://schema.org/InStock'
        stock_status = '在庫あり' if price > 0 and is_instock else '未発売・予約受付中'

        print(f" 📦 製品名 : {name}")
        print(f" 💰 価  格 : ¥{price:,}" if price > 0 else " 💰 価  格 : 価格未定")
        print(f" 🖼️ 画像URL: {image_url}")
        print(f" 🏷️ ジャンル: {unified_genre}")
        print("-" * 50)

        # 5. Djangoモデルへ保存
        unique_id = "minis-" + hashlib.md5(url_clean.encode()).hexdigest()[:12]
        PCProduct.objects.update_or_create(
            unique_id=unique_id,
            defaults={
                'site_prefix': 'MINIS',
                'maker': MAKER_NAME,
                'name': name,
                'price': price,
                'url': url_clean,
                'affiliate_url': affiliate_url,
                'affiliate_link_html': affiliate_link_html,
                'image_url': image_url,
                'description': description,
                'is_active': True,
                'stock_status': stock_status,
                'raw_genre': raw_genre,
                'unified_genre': unified_genre,
            }
        )
        return True

    except Exception as e:
        print(f" ❌ 解析失敗: {e}")
        return False

# ==========================================
# 🚀 3. メインクローラー
# ==========================================

def run_minis_crawler():
    list_url = "https://www.minisforum.jp/collections/all-product?page=1"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        print(f"📂 MINISFORUM 全製品スキャン開始 (画像・ジャンル適正化版)")
        try:
            # networkidle ではなく domcontentloaded を使用してタイムアウトを回避
            page.goto(list_url, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(3000) 
            
            # 全aタグから商品ページのURLを抽出
            hrefs = page.evaluate('''() => {
                const links = Array.from(document.querySelectorAll('a'));
                return links.map(a => a.href);
            }''')
            
            # "/products/" を含み、重複を除去してソート
            product_urls = sorted(list(set([h.split('?')[0] for h in hrefs if "/products/" in h])))
            print(f"📊 解析対象URL: {len(product_urls)}件")

            for i, url in enumerate(product_urls):
                scrape_minis_page(page, url, i, len(product_urls))
                # サーバー負荷軽減のためランダム待機
                time.sleep(random.uniform(2.0, 4.0))

        except Exception as e:
            print(f" ⚠️ リスト取得失敗: {e}")
        
        browser.close()
        print(f"\n✨ すべての製品データの同期が完了しました。")

if __name__ == "__main__":
    run_minis_crawler()