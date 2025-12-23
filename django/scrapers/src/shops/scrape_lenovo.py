import os
import django
import re
import time
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# --- Django設定 ---
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import PCProduct

def get_genre_from_url(url):
    """URLから製品ジャンルを推測する"""
    if "/laptops/" in url or "/yoga/" in url or "/thinkpad/" in url:
        return "laptop"
    if "/desktops/" in url or "/legion/" in url:
        return "desktop"
    if "/workstations/" in url:
        return "workstation"
    if "/servers/" in url:
        return "server"
    if "/tablets/" in url:
        return "tablet"
    return "pc"

def extract_specs(soup):
    specs_list = []
    container = soup.select_one('.sph-o-overview, .overview, [class*="overview"]')
    if container:
        ul = container.find('ul')
        if ul:
            for li in ul.find_all('li'):
                for sup in li.find_all('sup'):
                    sup.decompose()
                text = li.get_text(" ", strip=True)
                text = re.sub(r'\s+', ' ', text)
                if len(text) > 3:
                    specs_list.append(text)
    return " / ".join(list(dict.fromkeys(specs_list)))

def extract_image_url(page):
    selector = ".gallery-canvas .canvas-item img, .gallery-container img"
    try:
        img_handle = page.wait_for_selector(selector, timeout=5000)
        if img_handle:
            src = img_handle.get_attribute("src")
            if src:
                if src.startswith('//'): return "https:" + src
                if src.startswith('/'): return "https://www.lenovo.com" + src
                return src
    except:
        pass
    return ""

def extract_price(soup, html_content):
    for element in soup.find_all(['span', 'dd', 'div', 'p']):
        text = element.get_text()
        if '販売価格' in text:
            digits = re.sub(r'[^\d]', '', text)
            if digits and 30000 < int(digits) < 2000000: # サーバー等も考慮し上限を上げ
                return int(digits)
    return 0

def scrape_detail_page(page, url):
    print(f"🔎 巡回中... {url}")
    try:
        unique_id = url.split('/')[-1]
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        page.evaluate("window.scrollBy(0, 500)")
        page.wait_for_timeout(2000)
        
        soup = BeautifulSoup(page.content(), 'html.parser')
        
        genre = get_genre_from_url(url) # ジャンル判別
        price = extract_price(soup, page.content())
        image_url = extract_image_url(page)
        specs_text = extract_specs(soup)
        
        save_data = {
            'unique_id': unique_id,
            'site_prefix': 'LEN',
            'maker': 'Lenovo',
            'raw_genre': genre,
            'unified_genre': genre,
            'name': page.title().split('|')[0].strip(),
            'price': price,
            'url': url,
            'image_url': image_url,
            'description': specs_text,
            'raw_html': page.content(),
            'stock_status': '在庫あり' if price > 0 else '受注停止',
            'is_active': True,
        }

        PCProduct.objects.update_or_create(unique_id=unique_id, defaults=save_data)
        print(f"✅ 保存: [{genre}] {save_data['name']}")
        return True
    except Exception as e:
        print(f"  ❌ エラー: {e}")
        return False

def run_crawler():
    # 網羅的なカテゴリーURLリスト
    target_categories = [
        # ノート
        "https://www.lenovo.com/jp/ja/c/laptops/thinkpad/",
        "https://www.lenovo.com/jp/ja/c/laptops/yoga/",
        "https://www.lenovo.com/jp/ja/c/laptops/lenovo-legion-laptops/",
        # デスクトップ
        "https://www.lenovo.com/jp/ja/c/desktops/thinkcentre/",
        "https://www.lenovo.com/jp/ja/c/desktops/ideacentre/",
        "https://www.lenovo.com/jp/ja/c/desktops/legion-desktops/",
        # ワークステーション
        "https://www.lenovo.com/jp/ja/c/workstations/thinkstation-p-series/",
        # サーバー（構造が違う場合は要調整ですがまずは共通で試行）
        "https://www.lenovo.com/jp/ja/c/servers-storage/servers/racks/",
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        page = context.new_page()
        
        all_product_urls = set()
        for cat_url in target_categories:
            print(f"📂 スキャン中: {cat_url}")
            try:
                page.goto(cat_url, wait_until="domcontentloaded")
                page.wait_for_timeout(5000)
                # 全製品詳細リンクを抽出 (/p/ 以下の製品ページ)
                hrefs = page.eval_on_selector_all('a[href*="/p/"]', 'elements => elements.map(e => e.href)')
                all_product_urls.update({url.split('?')[0].rstrip('/') for url in hrefs if "/p/" in url})
            except Exception as e:
                print(f"  ❌ 取得失敗: {e}")
        
        print(f"🚀 合計 {len(all_product_urls)}件の全製品を処理開始")
        for i, url in enumerate(all_product_urls):
            scrape_detail_page(page, url)
            time.sleep(2)
        browser.close()

if __name__ == "__main__":
    run_crawler()