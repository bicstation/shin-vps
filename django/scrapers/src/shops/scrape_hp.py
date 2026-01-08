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

def scrape_hp_category(page, url, genre):
    """カテゴリーページを解析してDB保存"""
    print(f"🔎 HPカテゴリ解析中... {url}")
    try:
        page.goto(url, wait_until="networkidle", timeout=60000)
        
        # 製品アイテムが表示されるまで待機
        try:
            page.wait_for_selector(".product-item", timeout=10000)
        except:
            print(f" ⚠️ 製品が見つかりませんでした: {url}")
            return

        # スクロールして画像を読み込ませる
        for _ in range(3):
            page.evaluate("window.scrollBy(0, 1000)")
            page.wait_for_timeout(800)

        soup = BeautifulSoup(page.content(), 'html.parser')
        items = soup.select(".product-item")
        
        print(f"📦 このページで {len(items)} 件の製品を見つけました")

        for item in items:
            try:
                # 1. 製品名
                name_tag = item.select_one(".name, .product-name")
                if not name_tag: continue
                name = name_tag.get_text(strip=True)

                # 2. リンクとID（日本語排除）
                link_tag = item.select_one("a[href*='/directplus/'], a[href*='/shop/pdp/']")
                if not link_tag: continue
                
                raw_url = link_tag['href']
                product_url = raw_url if raw_url.startswith('http') else "https://jp.ext.hp.com" + raw_url
                
                # --- 【重要】日本語排除ロジック ---
                # URLの末尾を取得し、英数字とハイフン以外を消す
                raw_id_part = product_url.split('/')[-1] or product_url.split('/')[-2]
                safe_id = re.sub(r'[^a-zA-Z0-9-]', '', raw_id_part)
                
                # IDが空、または短すぎる場合はハッシュ化
                if len(safe_id) < 3:
                    safe_id = hashlib.md5(product_url.encode()).hexdigest()[:10]
                
                unique_id = f"hp-{safe_id}"
                # -------------------------------

                # 3. 価格
                price_tag = item.select_one(".price-amount, .price")
                price = extract_price(price_tag.get_text()) if price_tag else 0

                # 4. 画像
                img_tag = item.select_one("img")
                image_url = ""
                if img_tag:
                    image_url = img_tag.get('data-original') or img_tag.get('src') or ""
                    if image_url.startswith('//'): image_url = "https:" + image_url
                    elif image_url.startswith('/'): image_url = "https://jp.ext.hp.com" + image_url

                # 5. スペック
                spec_tags = item.select(".spec-list li, .summary-spec li")
                specs = " / ".join([s.get_text(strip=True) for s in spec_tags])

                # DB保存
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
                        'description': specs or f"HP公式 {genre} - {name}",
                        'is_active': True,
                        'stock_status': '在庫あり' if price > 0 else '確認中',
                    }
                )
                print(f"  ✅ 保存: {unique_id} | {name[:20]}...")

            except Exception as e:
                continue

    except Exception as e:
        print(f"  ❌ カテゴリ取得エラー: {e}")

def run_crawler():
    # HPの主要カテゴリURL（以前のコードより最新のキャンペーンページを追加）
    categories = [
        ("https://jp.ext.hp.com/promotions/personal/weekend/", "laptop"),     # 週末セール
        ("https://jp.ext.hp.com/notebooks/personal/omnibook_ultra/", "laptop"),
        ("https://jp.ext.hp.com/desktops/personal/", "desktop"),
        ("https://www.hp.com/jp-ja/shop/vpcs/gaming-desktops.html", "gaming_pc"), # ゲーミング
        ("https://jp.ext.hp.com/notebooks/business/", "laptop"),
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        page = context.new_page()

        for url, genre in categories:
            scrape_hp_category(page, url, genre)
            time.sleep(2)

        browser.close()
        print("✨ HPスクレイピング完了")

if __name__ == "__main__":
    run_crawler()