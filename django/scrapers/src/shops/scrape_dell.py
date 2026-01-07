import os
import django
import re
import json
import time
import random
import hashlib  # 回避策用に追加
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from django.db import transaction

# --- Django設定 ---
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import PCProduct

def get_refined_genre(url, name):
    """
    製品名とURLからジャンルを日本語・英語両方で高精度に判定する
    """
    text = (url + " " + name).lower()
    
    if any(k in text for k in ["monitor", "モニター", "ディスプレイ", "display"]):
        return "monitor"
    
    if any(k in text for k in ["alienware", "gaming", "ゲーミング", "g-series"]):
        return "gaming_pc"
    
    if any(k in text for k in [
        "backpack", "バックパック", "mouse", "マウス", "keyboard", "キーボード", 
        "headset", "ヘッドセット", "adapter", "アダプター", "スピーカー", "speaker", 
        "ケース", "sleeve", "スリーブ", "dock", "ドック", "hub", "ハブ", "webcam", "ウェブカメラ"
    ]):
        return "accessories"
    
    if any(k in text for k in [
        "laptop", "ノートパソコン", "inspiron", "xps", "2-in-1", "ノートpc", 
        "latitude", "vostro", "convertible", "コンバーチブル"
    ]):
        return "laptop"
    
    if any(k in text for k in [
        "desktop", "デスクトップ", "optiplex", "precision", "スリムデスクトップ",
        "all-in-one", "オールインワン", "tower", "タワー", "micro", "マイクロ"
    ]):
        return "desktop"
    
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
        # --- 日本語排除ロジック ---
        raw_last_part = url.split('/')[-1]
        # 英数字以外を削除（これで日本語URL対策完了）
        safe_last_part = re.sub(r'[^a-zA-Z0-9-]', '', raw_last_part)
        
        # IDが空になった場合（日本語だけのURL末尾など）はURLのハッシュをIDにする
        if not safe_last_part:
            safe_last_part = hashlib.md5(url.encode()).hexdigest()[:12]
            
        unique_id = "dell-" + safe_last_part
        # ------------------------

        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(2500)
        
        soup = BeautifulSoup(page.content(), 'html.parser')
        json_data = extract_from_json_ld(soup)
        
        name = json_data["name"] or page.title().split('|')[0].strip()
        name = name.replace('Dell 日本', '').strip()
        
        genre = get_refined_genre(url, name)
        
        price = json_data["price"]
        if price == 0:
            price_el = soup.select_one('[data-testid="shared-ps-dell-price"], .ps-dell-price, .dell-price')
            if price_el:
                price_text = re.sub(r'[^\d]', '', price_el.get_text())
                if price_text: price = int(price_text)

        image_url = json_data["image"] or ""
        if not image_url:
            img_handle = page.query_selector('img[data-testid="shared-ps-image"], .ps-image img')
            if img_handle:
                src = img_handle.get_attribute("src")
                image_url = "https:" + src if src and src.startswith('//') else src

        with transaction.atomic():
            PCProduct.objects.update_or_create(
                unique_id=unique_id,
                defaults={
                    'site_prefix': 'DELL',
                    'maker': 'Dell',
                    'raw_genre': genre,
                    'unified_genre': genre,
                    'name': name,
                    'price': price,
                    'url': url,
                    'image_url': image_url,
                    'description': f"Dell公式 {genre} カテゴリ製品 - {name}",
                    'stock_status': '在庫あり' if price > 0 else '詳細確認',
                    'is_active': True,
                }
            )
        
        price_display = f"¥{price:,}" if price > 0 else "価格不明"
        print(f"🔎 [{current_index + 1}/{total_count}] ✅ 保存完了 [ID: {unique_id}]: {name[:30]}...")
        return True
    except Exception as e:
        print(f"   ❌ エラー: {url} -> {e}")
        return False

def run_crawler():
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
        )
        page = context.new_page()
        page.route("**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,css}", 
                   lambda route: route.abort() if route.request.resource_type != "document" else route.continue_())

        all_product_urls = set()
        for cat_url in target_categories:
            print(f"📂 カテゴリースキャン中: {cat_url}")
            try:
                page.goto(cat_url, wait_until="commit", timeout=60000)
                page.wait_for_timeout(3000)
                for _ in range(5):
                    page.evaluate("window.scrollBy(0, 1000)")
                    page.wait_for_timeout(800)
                
                hrefs = page.eval_on_selector_all('a[href*="/shop/"]', 
                    'elements => elements.map(e => e.href)')
                
                for h in hrefs:
                    clean_h = h.split('#')[0].split('?')[0].rstrip('/')
                    if any(p in clean_h for p in ["spd", "pdp", "pd", "cp"]):
                        all_product_urls.add(clean_h)
            except:
                print(f"   ❌ スキャン失敗: {cat_url}")
        
        url_list = sorted(list(all_product_urls))
        total_count = len(url_list)
        for i, url in enumerate(url_list): 
            scrape_detail_page(page, url, i, total_count)
            time.sleep(random.uniform(0.5, 1.0))
            
        browser.close()
        print(f"✨ 完了しました。")

if __name__ == "__main__":
    run_crawler()