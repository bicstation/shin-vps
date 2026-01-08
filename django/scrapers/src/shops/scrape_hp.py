import os
import django
import re
import time
import hashlib
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# --- Django設定 ---
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import PCProduct

def extract_price(text):
    """HPの価格テキストから数値を抽出"""
    if not text: return 0
    nums = re.sub(r'[^\d]', '', text)
    return int(nums) if nums else 0

def scrape_individual_page(page, product_url, genre):
    """個別ページ（PDP）を詳細に解析してDBに保存"""
    print(f"  📖 個別ページ解析中: {product_url}")
    try:
        page.goto(product_url, wait_until="networkidle", timeout=60000)
        soup = BeautifulSoup(page.content(), 'html.parser')

        # 1. 製品名 (titleタグから取得するのがHPのPDPでは最も確実)
        name = soup.title.string.split('|')[0].strip() if soup.title else "HP製品"
        
        # 2. 価格
        price_tag = soup.select_one(".price-amount, #price-amount, .product-price")
        price = extract_price(price_tag.get_text()) if price_tag else 0

        # 3. 画像
        img_tag = soup.select_one(".product-image img, #pdp-main-image, .hero-image img")
        image_url = ""
        if img_tag:
            image_url = img_tag.get('src') or img_tag.get('data-src') or ""
            if image_url.startswith('//'): image_url = "https:" + image_url
            elif image_url.startswith('/'): image_url = "https://jp.ext.hp.com" + image_url

        # 4. スペック詳細 (ddタグやスペックリストから取得)
        spec_list = []
        for spec_item in soup.select(".model_spec_text, .d_model_spec_modal dd, .spec-item"):
            txt = spec_item.get_text(strip=True)
            if txt: spec_list.append(txt)
        specs = " / ".join(spec_list[:10]) # 長すぎないように制限

        # 5. Unique ID
        raw_id_part = product_url.split('/')[-1] or product_url.split('/')[-2]
        safe_id = re.sub(r'[^a-zA-Z0-9-]', '', raw_id_part)
        if len(safe_id) < 3:
            safe_id = hashlib.md5(product_url.encode()).hexdigest()[:10]
        unique_id = f"hp-{safe_id}"

        # DB保存/更新
        PCProduct.objects.update_or_create(
            unique_id=unique_id,
            defaults={
                'site_prefix': 'HP',
                'maker': 'HP',
                'raw_genre': genre,
                'unified_genre': genre,
                'name': name,
                'price': price,
                'url': product_url,
                'image_url': image_url,
                'description': specs if specs else f"HP公式 {genre} - {name}",
                'is_active': True,
                'stock_status': '在庫あり' if price > 0 else '在庫確認中',
            }
        )
        print(f"    ✅ 保存完了: {name[:30]}")

    except Exception as e:
        print(f"    ❌ 個別ページ解析エラー: {e}")

def scrape_hp_search_results(page, start_url, genre):
    """検索結果一覧から全URLを抽出し、個別ページへ誘導する"""
    print(f"🔎 HP検索一覧解析開始: {start_url}")
    page.goto(start_url, wait_until="networkidle", timeout=90000)
    
    all_product_urls = set()
    page_num = 1
    
    # --- STEP 1: 全製品のURLを収集 ---
    while True:
        print(f"📑 検索結果ページ {page_num} からURLを収集しています...")
        try:
            page.wait_for_selector(".hawk-results-item, .hawk-item", timeout=20000)
        except:
            break

        # スクロールして全要素をロード
        for _ in range(3):
            page.mouse.wheel(0, 1000)
            page.wait_for_timeout(500)

        soup = BeautifulSoup(page.content(), 'html.parser')
        items = soup.select(".hawk-results-item, .hawk-item")
        
        for item in items:
            link_tag = item.select_one("a")
            if link_tag and link_tag.has_attr('href'):
                href = link_tag['href']
                full_url = href if href.startswith('http') else "https://jp.ext.hp.com" + href
                all_product_urls.add(full_url)

        # 次へボタンの処理
        next_button = page.query_selector(".hawk-pagination-next, .hawk-page-next")
        if next_button and next_button.is_visible() and next_button.is_enabled():
            next_button.click()
            page.wait_for_timeout(3000)
            page_num += 1
            if page_num > 30: break # 安全装置
        else:
            break

    print(f"📦 合計 {len(all_product_urls)} 件のURLを収集しました。詳細解析を開始します。")

    # --- STEP 2: 各URLを巡回して詳細情報を取得 ---
    for i, url in enumerate(all_product_urls):
        print(f"[{i+1}/{len(all_product_urls)}]")
        scrape_individual_page(page, url, genre)
        time.sleep(1) # サーバー負荷軽減

def run_crawler():
    # ターゲットURL
    start_url = "https://jp.ext.hp.com/search/?orderBy=score&type=Product"
    genre = "laptop"

    with sync_playwright() as p:
        # headless=Falseにすると、自宅PCで動作が目視確認できます
        browser = p.chromium.launch(headless=True) 
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        try:
            scrape_hp_search_results(page, start_url, genre)
        finally:
            browser.close()
            print("✨ 全工程が完了しました")

if __name__ == "__main__":
    run_crawler()