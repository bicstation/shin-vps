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

def extract_price(text):
    """HPの価格テキストから数値を抽出（例: ￥124,800（税込）～ -> 124800）"""
    if not text: return 0
    nums = re.sub(r'[^\d]', '', text)
    return int(nums) if nums else 0

def scrape_hp_category(page, url, genre):
    """特定のカテゴリーページ（ノートPC一覧など）を解析して保存"""
    print(f"🔎 HPカテゴリ解析中... {url}")
    try:
        page.goto(url, wait_until="networkidle", timeout=60000)
        
        # HPの製品カード（.product-item）が表示されるまで待つ
        page.wait_for_selector(".product-item", timeout=10000)
        
        # 遅延読み込み画像（Lazy Load）を実体化させるために下までスクロール
        for _ in range(3):
            page.evaluate("window.scrollBy(0, 1000)")
            page.wait_for_timeout(500)

        soup = BeautifulSoup(page.content(), 'html.parser')
        items = soup.select(".product-item")
        
        print(f"📦 このページで {len(items)} 件の製品を見つけました")

        for item in items:
            try:
                # 1. 製品名
                name_tag = item.select_one(".name, .product-name")
                if not name_tag: continue
                name = name_tag.get_text(strip=True)

                # 2. 固有ID (URLや型番から抽出)
                link_tag = item.select_one("a[href*='/directplus/']")
                if not link_tag: continue
                product_url = "https://jp.ext.hp.com" + link_tag['href']
                unique_id = product_url.split('/')[-2] if product_url.endswith('/') else product_url.split('/')[-1]

                # 3. 価格
                price_tag = item.select_one(".price-amount, .price")
                price = extract_price(price_tag.get_text()) if price_tag else 0

                # 4. 画像 (HPは lazy load のため data-original や src を使い分け)
                img_tag = item.select_one("img")
                image_url = ""
                if img_tag:
                    image_url = img_tag.get('data-original') or img_tag.get('src') or ""
                    if image_url.startswith('//'): image_url = "https:" + image_url
                    elif image_url.startswith('/'): image_url = "https://jp.ext.hp.com" + image_url

                # 5. スペック (HPの一覧にはスペックが箇条書きされている)
                spec_tags = item.select(".spec-list li, .summary-spec li")
                specs = " / ".join([s.get_text(strip=True) for s in spec_tags])

                # 保存
                save_data = {
                    'unique_id': f"HP_{unique_id}",
                    'site_prefix': 'HP',
                    'maker': 'HP',
                    'raw_genre': genre,
                    'unified_genre': genre,
                    'name': name,
                    'price': price,
                    'url': product_url,
                    'image_url': image_url,
                    'description': specs,
                    'is_active': True,
                    'stock_status': '在庫あり' if price > 0 else '確認中',
                }

                PCProduct.objects.update_or_create(
                    unique_id=save_data['unique_id'],
                    defaults=save_data
                )
                print(f"  ✅ 保存: {name[:30]}... ({price}円)")

            except Exception as e:
                print(f"  ⚠️ 個別製品エラー: {e}")
                continue

    except Exception as e:
        print(f"  ❌ カテゴリ取得エラー: {e}")

def run_crawler():
    # HPの主要カテゴリURL
    categories = [
        ("https://jp.ext.hp.com/notebooks/personal/omnibook_ultra/", "laptop"),      # 個人向けノート
        ("https://jp.ext.hp.com/notebooks/personal/omnibook_x/", "laptop"),      # 個人向けノート
        ("https://jp.ext.hp.com/desktops/personal/", "desktop"),      # 個人向けデスク
        ("https://www.hp.com/jp-ja/gaming-pc.html", "desktop"),       # ゲーミング(OMEN)
        ("https://jp.ext.hp.com/notebooks/business/", "laptop"),     # 法人向けノート
        ("https://jp.ext.hp.com/desktops/business/", "desktop"),     # 法人向けデスク
        ("https://jp.ext.hp.com/workstations/", "workstation") # ワークステーション
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        page = context.new_page()

        for url, genre in categories:
            scrape_hp_category(page, url, genre)
            time.sleep(3)

        browser.close()

if __name__ == "__main__":
    run_crawler()