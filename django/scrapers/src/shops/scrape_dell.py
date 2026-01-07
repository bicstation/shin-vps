import os
import django
import re
import json
import time
import random
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from django.db import transaction

# --- Django設定 ---
# 実行環境に合わせて設定してください
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import PCProduct

def get_refined_genre(url, name):
    """
    製品名とURLからジャンルを日本語・英語両方で判定する
    """
    # 判定用のテキストを統合して小文字化
    text = (url + " " + name).lower()
    
    # 1. モニター
    if any(k in text for k in ["monitor", "モニター", "ディスプレイ", "display"]):
        return "monitor"
    
    # 2. ゲーミングPC
    if any(k in text for k in ["alienware", "gaming", "ゲーミング", "g-series"]):
        return "gaming_pc"
    
    # 3. ノートパソコン (laptop)
    # 日本語の「ノートパソコン」と英語の「laptop」両方に対応
    if any(k in text for k in ["laptop", "ノートパソコン", "inspiron", "xps", "2-in-1", "ノートpc"]):
        return "laptop"
    
    # 4. ビジネスノートパソコン
    if any(k in text for k in ["vostro", "latitude"]):
        return "business_laptop"
    
    # 5. デスクトップ
    if any(k in text for k in ["desktop", "デスクトップ", "optiplex", "precision", "スリムデスクトップ"]):
        return "desktop"
    
    # 6. 周辺機器・アクセサリー
    if any(k in text for k in ["backpack", "バックパック", "mouse", "マウス", "keyboard", "キーボード", 
                               "headset", "ヘッドセット", "adapter", "アダプター", "スピーカー", "speaker", "ケース"]):
        return "accessories"
    
    # 判定不能な場合はデフォルト
    return "pc"

def extract_from_json_ld(soup):
    """HTML内のJSON-LDから製品情報を抽出"""
    result = {"name": "", "price": 0, "image": None}
    scripts = soup.find_all('script', type='application/ld+json')
    for script in scripts:
        try:
            data = json.loads(script.string)
            items = data if isinstance(data, list) else [data]
            for item in items:
                if item.get('@type') == 'Product':
                    result["name"] = item.get('name', "")
                    offers = item.get('offers')
                    if offers:
                        if isinstance(offers, list): offers = offers[0]
                        p = offers.get('price')
                        if p:
                            result["price"] = int(float(str(p).replace(',', '')))
                    img = item.get('image')
                    if img:
                        result["image"] = img[0] if isinstance(img, list) else img
                    return result
        except: continue
    return result

def scrape_detail_page(page, url, current_index, total_count):
    """個別製品ページの情報をスクレイピングしてDB保存"""
    url = url.split('#')[0].split('?')[0].rstrip('/')
    
    try:
        unique_id = "dell-" + url.split('/')[-1]
        
        # 通信負荷を抑えるため HTML展開完了 で処理
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(2500) # JS描画待ち
        
        soup = BeautifulSoup(page.content(), 'html.parser')
        json_data = extract_from_json_ld(soup)
        
        # 名称の取得（タイトルから補完）
        name = json_data["name"] or page.title().split('|')[0].strip()
        name = name.replace('Dell 日本', '').strip()
        
        # 【重要】強化されたジャンル判定
        genre = get_refined_genre(url, name)
        
        # 価格の取得
        price = json_data["price"]
        if price == 0:
            price_el = soup.select_one('[data-testid="shared-ps-dell-price"], .ps-dell-price, .dell-price')
            if price_el:
                price_text = re.sub(r'[^\d]', '', price_el.get_text())
                if price_text: price = int(price_text)

        # 画像URL
        image_url = json_data["image"] or ""
        if not image_url:
            img_handle = page.query_selector('img[data-testid="shared-ps-image"], .ps-image img')
            if img_handle:
                src = img_handle.get_attribute("src")
                image_url = "https:" + src if src and src.startswith('//') else src

        # DB保存処理（トランザクションで確実化）
        with transaction.atomic():
            PCProduct.objects.update_or_create(
                unique_id=unique_id,
                defaults={
                    'site_prefix': 'DELL',
                    'maker': 'Dell',
                    'raw_genre': genre,
                    'unified_genre': genre, # laptop, accessories 等が設定される
                    'name': name,
                    'price': price,
                    'url': url,
                    'image_url': image_url,
                    'description': f"Dell公式 {genre} カテゴリ製品",
                    'stock_status': '在庫あり' if price > 0 else '詳細確認',
                    'is_active': True,
                }
            )
        
        price_display = f"¥{price:,}" if price > 0 else "価格不明"
        print(f"🔎 [{current_index + 1}/{total_count}] ✅ 分類 [{genre.upper()}]: {name[:30]}... ({price_display})")
        return True
    except Exception as e:
        print(f"   ❌ 詳細エラー: {url} -> {e}")
        return False

def run_crawler():
    """カテゴリースキャンから巡回開始"""
    target_categories = [
        "https://www.dell.com/ja-jp/shop/deals/top-pc-deals",
        "https://www.dell.com/ja-jp/shop/scc/sc/laptops",
        "https://www.dell.com/ja-jp/shop/scc/sc/desktops",
        "https://www.dell.com/ja-jp/shop/deals/gaming-deals",
        "https://www.dell.com/ja-jp/shop/deals/business-pc-deals",
        "https://www.dell.com/ja-jp/shop/deals/monitors-deals",
        "https://www.dell.com/ja-jp/shop/deals/pc-accessories-deals",
        "https://www.dell.com/ja-jp/shop/deals/clearance-pc-deals",
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={'width': 1280, 'height': 800}
        )
        
        # 高速化：不要なアセットをブロック
        page = context.new_page()
        page.route("**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,css}", 
                   lambda route: route.abort() if route.request.resource_type != "document" else route.continue_())

        all_product_urls = set()
        for cat_url in target_categories:
            print(f"📂 カテゴリースキャン中: {cat_url}")
            try:
                page.goto(cat_url, wait_until="commit", timeout=60000)
                page.wait_for_timeout(3000)
                # スクロールして全製品リンクを露出させる
                for _ in range(5):
                    page.evaluate("window.scrollBy(0, 1000)")
                    page.wait_for_timeout(800)
                
                hrefs = page.eval_on_selector_all('a[href*="/shop/"]', 
                    'elements => elements.map(e => e.href)')
                
                for h in hrefs:
                    clean_h = h.split('#')[0].split('?')[0].rstrip('/')
                    if any(p in clean_h for p in ["spd", "pdp", "pd", "cp"]):
                        all_product_urls.add(clean_h)
            except Exception as e:
                print(f"   ❌ スキャン失敗: {cat_url}")
        
        url_list = sorted(list(all_product_urls))
        total_count = len(url_list)
        print(f"🚀 合計 {total_count}件を最適なジャンルに分類しながら処理開始")
        
        # 全件ループ実行
        for i, url in enumerate(url_list): 
            scrape_detail_page(page, url, i, total_count)
            time.sleep(random.uniform(1, 2))
            
        browser.close()
        print(f"✨ 完了しました。DBのジャンルを確認してください。")

if __name__ == "__main__":
    run_crawler()