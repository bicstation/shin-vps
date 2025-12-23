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

def print_debug_info(data):
    """保存するデータをコンソールに整形して表示"""
    print("\n" + "="*60)
    print("📋 【モデル・マッピング確認】")
    print(f"🔗 URL: {data['url']}")
    print(f"🆔 ID : {data['unique_id']}")
    print(f"🔤 接頭辞: {data['site_prefix']} | メーカー: {data['maker']}")
    print(f"📁 ジャンル: {data['unified_genre']} ({data['raw_genre']})")
    print(f"💰 価格: {data['price']} 円")
    print(f"🖼️ 画像: {data['image_url']}")
    print(f"✅ 掲載中: {data['is_active']}")
    print(f"📝 スペック: \n   {data['description'][:150]}...")
    print("="*60 + "\n")

def extract_specs(soup):
    """
    スクショに基づき、.overview または .sph-o-overview からスペックを抽出
    """
    specs_list = []
    
    # スクショの2パターン (.overview と .sph-o-overview) を両方探す
    container = soup.select_one('.overview, .sph-o-overview, [class*="overview"]')
    
    if container:
        ul = container.find('ul')
        if ul:
            for li in ul.find_all('li'):
                # ® や ™ などの上付き文字を除去
                for sup in li.find_all('sup'):
                    sup.decompose()
                
                # li内の全テキストを取得（pタグ等に包まれていてもOK）
                text = li.get_text(" ", strip=True)
                
                # 不要な記号や空行を整理
                text = re.sub(r'\s+', ' ', text)
                if len(text) > 3: # 極端に短いゴミデータを除外
                    specs_list.append(text)
    
    # 万が一上記で取れなかった場合のフォールバック（従来のスペック表）
    if not specs_list:
        for row in soup.select('.product-specs tr, .system-specs tr, .techSpecs-table tr'):
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                specs_list.append(f"{cells[0].get_text(strip=True)}: {cells[1].get_text(strip=True)}")

    return " / ".join(list(dict.fromkeys(specs_list)))

def extract_image_url(soup, raw_content):
    """画像URL特定ロジック"""
    image_patterns = re.findall(r'https://p[0-9]-ofp\.static\.pub/[^\s"\'<>]+?\.(?:png|jpg|jpeg)[^\s"\'<>]*', raw_content, re.IGNORECASE)
    if image_patterns:
        exclude = ["sustainability", "logo", "banner", "icon", "badge", "feature"]
        priority = ["/products/", "/product-img/", "420x420", "584x584", "400x400"]
        valid = [img.split('"')[0].split("'")[0] for img in image_patterns if not any(ex in img.lower() for ex in exclude)]
        for img in valid:
            if any(pri in img for pri in priority): return img
        if valid: return valid[0]
    return ""

def extract_price(soup, html_content):
    """価格抽出ロジック"""
    for element in soup.find_all(['span', 'dd', 'div', 'p']):
        text = element.get_text()
        if '販売価格' in text:
            digits = re.sub(r'[^\d]', '', text)
            if not digits: digits = re.sub(r'[^\d]', '', element.parent.get_text())
            if digits and 100000 < int(digits) < 600000: return int(digits)
    
    prices = re.findall(r'¥\s?([0-9,]+)', html_content)
    valid = [int(p.replace(',', '')) for p in prices if 100000 < int(p.replace(',', '')) < 600000]
    return max(valid) if valid else 0

def scrape_detail_page(page, url):
    """個別解析・保存ロジック"""
    print(f"🔎 巡回中... {url}")
    try:
        unique_id = url.split('/')[-1]
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        
        # どちらかのオーバービューが出るまで待機
        try:
            page.wait_for_selector(".overview, .sph-o-overview", timeout=10000)
        except:
            pass
        
        page.evaluate("window.scrollBy(0, 500)")
        page.wait_for_timeout(2000)
        
        raw_content = page.content()
        soup = BeautifulSoup(raw_content, 'html.parser')
        
        price = extract_price(soup, raw_content)
        image_url = extract_image_url(soup, raw_content)
        specs_text = extract_specs(soup)
        
        save_data = {
            'unique_id': unique_id,
            'site_prefix': 'LEN',
            'maker': 'Lenovo',
            'raw_genre': 'laptop',
            'unified_genre': 'laptop',
            'name': page.title().split('|')[0].strip(),
            'price': price,
            'url': url,
            'image_url': image_url,
            'description': specs_text,
            'raw_html': raw_content,
            'stock_status': '在庫あり' if price > 0 else '受注停止',
            'is_active': True,
        }

        print_debug_info(save_data)
        PCProduct.objects.update_or_create(unique_id=unique_id, defaults=save_data)
        return True
            
    except Exception as e:
        print(f"  ❌ エラー発生: {e}")
        return False

def extract_product_urls(page, list_url):
    page.goto(list_url, wait_until="domcontentloaded")
    page.wait_for_timeout(5000)
    hrefs = page.eval_on_selector_all('a[href*="/p/laptops/"]', 'elements => elements.map(e => e.href)')
    return list({url.split('#')[0].split('?')[0].rstrip('/') for url in hrefs})

def run_crawler():
    target_series = [
        "https://www.lenovo.com/jp/ja/c/laptops/thinkpad/thinkpad-x-series/",
        "https://www.lenovo.com/jp/ja/c/laptops/thinkpad/thinkpad-t-series/",
        "https://www.lenovo.com/jp/ja/c/laptops/thinkpad/thinkpad-l-series/",
        "https://www.lenovo.com/jp/ja/c/laptops/thinkpad/thinkpad-e-series/",
        "https://www.lenovo.com/jp/ja/c/laptops/thinkpad/thinkpad-p-series/",
        "https://www.lenovo.com/jp/ja/c/laptops/thinkpad/thinkpad-z-series/",
        "https://www.lenovo.com/jp/ja/c/laptops/yoga/yoga-2-in-1-series/",
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        page = context.new_page()
        
        all_product_urls = set()
        for series_url in target_series:
            print(f"📂 カテゴリをスキャン中: {series_url}")
            try:
                urls = extract_product_urls(page, series_url)
                all_product_urls.update(urls)
            except Exception as e:
                print(f"  ❌ リスト取得失敗: {e}")
        
        print(f"🚀 合計 {len(all_product_urls)}件を処理開始します。")
        for i, url in enumerate(all_product_urls):
            print(f"\n[{i+1}/{len(all_product_urls)}]")
            scrape_detail_page(page, url)
            time.sleep(2)
            
        browser.close()

if __name__ == "__main__":
    run_crawler()