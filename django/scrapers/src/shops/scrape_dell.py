import os
import django
import re
import json
import time
import random
import hashlib
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# --- Django設定 ---
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import PCProduct

# ==========================================
# 🔑 1. 設定情報
# ==========================================
FIXED_AFFILIATE_LINK = 'https://click.linksynergy.com/fs-bin/click?id=nNBA6GzaGrQ&offerid=1568114.10004952&type=3&subid=0'

# ==========================================
# 🛠️ 2. 解析エンジン
# ==========================================

def get_image_url_from_source(html_content):
    """高画質な製品画像を抽出。"""
    pattern = r'https?://i\.dell\.com/is/image/DellContent/[^"\s?{}<>]+'
    matches = re.findall(pattern, html_content)
    for url in matches:
        if any(x in url.lower() for x in ['60x48', 'seasonal', 'logo', 'icon', 'flag', 'nav', 'fnav', 'banner']):
            continue
        return f"{url}?fmt=png-alpha&wid=800"
    return ""

def clean_spec_text(text):
    """不要な文言、電話番号、相談窓口などを徹底排除"""
    if not text or "未検出" in text:
        return "未検出"
    
    noise_patterns = [
        r"見積り・購入相談.*?(平日|まで)", 
        r"0120-\d+-\d+", 
        r"チャット・LINE", 
        r"ノートパソコンと2-in-1 PC", 
        r"XPSノートパソコン", 
        r"すべて展開", 
        r"詳細情報",
        r"お勧めします", 
        r"お客様に最適な", 
        r"のプロセッサー",
        r"インテルの詳細情報 製品",
        r"Windows 11 (Home|Pro), Copilot\+ PC",
        r"オペレーティング システム言語パック"
    ]
    
    cleaned = text
    for p in noise_patterns:
        cleaned = re.sub(p, "", cleaned, flags=re.IGNORECASE)
    
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned if len(cleaned) > 0 else "未検出"

def extract_specs_ultimate(page, soup):
    """
    1. 特定のデータ属性(data-testid)から抽出
    2. 失敗した場合は、画面上の全テキストから正規表現で抽出
    """
    specs = {'cpu': '未検出', 'mem': '未検出', 'ssd': '未検出', 'gpu': '未検出', 'os': '未検出', 'disp': '未検出'}
    
    # 戦略1: data-testid による直接抽出
    spec_map = {
        'cpu': 'processor', 'mem': 'memory', 'ssd': 'hard-drive', 
        'gpu': 'video-card', 'os': 'operating-system', 'disp': 'display'
    }
    for key, tid in spec_map.items():
        el = soup.find(attrs={"data-testid": f"shared-ps-spec-description-{tid}"})
        if el:
            specs[key] = clean_spec_text(el.get_text())

    # 戦略2: 画面上の全テキストから執念の検索
    # (ボタンクリック後の最新テキストを取得)
    visible_text = page.evaluate("() => document.body.innerText")
    
    patterns = {
        'cpu': r'((?:第\d+世代)?\s*(?:Core|Ryzen|Ultra|i[3579]|Apple|Pentium|Snapdragon)[^ \n\r\t|]{2,}[^|\n\r\t]+?(?:プロセッサー|CPU))',
        'mem': r'(\d+\s*GB\s*(?:LPDDR\d*|DDR\d*|統合|内蔵|メモリ|RAM)[^|\n\r\t]*)',
        'ssd': r'(\d+\s*(?:GB|TB)\s*(?:M\.2|NVMe|PCIe|SSD|ハードドライブ|ストレージ))',
        'gpu': r'((?:NVIDIA|GeForce|RTX|Radeon|Arc|インテル|UHD|グラフィックス)[^|\n\r\t]+?(?:Video\s*Card|ビデオカード|GPU|内蔵)?)',
        'os': r'(Windows\s*11\s*(?:Home|Pro)[^|\n\r\t]*)',
        'disp': r'(\d+\.?\d?\s*インチ[^|\n\r\t]+?(?:ディスプレイ|液晶|モニター|解像度|2K|4K|OLED))'
    }

    for key, pattern in patterns.items():
        if specs[key] == '未検出':
            m = re.search(pattern, visible_text, re.I)
            if m:
                specs[key] = clean_spec_text(m.group(1))

    return f"{specs['cpu']} / {specs['mem']} / {specs['ssd']} / {specs['gpu']} / {specs['disp']} / {specs['os']}"

def extract_main_price(soup):
    """保守サービス等の安価なオプションを除外し、PC本体の価格を狙う"""
    prices = []
    # 構造化データ
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(script.string)
            items = data if isinstance(data, list) else [data]
            for item in items:
                offers = item.get('offers', {})
                p = offers[0].get('price') if isinstance(offers, list) else offers.get('price')
                if p: prices.append(int(float(str(p).replace(',', ''))))
        except: continue
    
    # セレクタ抽出
    for sel in ['.ps-dell-price', '[data-testid="shared-ps-dell-price"]', '.monetization-price']:
        for el in soup.select(sel):
            p_text = re.sub(r'[^\d]', '', el.get_text())
            if p_text: prices.append(int(p_text))
    
    # 本体価格（4.5万円以上）を優先
    valid = [p for p in prices if 45000 < p < 3000000]
    return min(valid) if valid else (max(prices) if prices else 0)

# ==========================================
# 🚀 3. メインクローラー
# ==========================================

def scrape_detail_page(page, url, current_index, total_count):
    url_clean = url.split('#')[0].split('?')[0].rstrip('/')
    remaining = total_count - (current_index + 1)
    
    print(f"🔎 [{current_index + 1}/{total_count}] 巡回中... {url_clean}")
    
    try:
        # タイムアウトを長めに設定
        page.goto(url_clean, wait_until="domcontentloaded", timeout=60000)
        
        # 💡 重要：邪魔なバナーの削除と、詳細スペックの強制表示
        page.evaluate("""() => {
            // Cookieバナーやポップアップを削除
            const overlaySelectors = ['#onetrust-banner-sdk', '.optanon-alert-box-wrapper', '.highcharts-container'];
            overlaySelectors.forEach(sel => {
                const el = document.querySelector(sel);
                if(el) el.remove();
            });
            // 「すべての仕様を表示」などのボタンがあればクリックして展開
            const buttons = Array.from(document.querySelectorAll('button, a'));
            const specBtn = buttons.find(b => b.innerText.includes('すべての仕様') || b.innerText.includes('View all specs'));
            if(specBtn) specBtn.click();
        }""")
        
        # 展開とレンダリングのための待機
        page.wait_for_timeout(4000)
        page.evaluate("window.scrollTo(0, 1000)")
        
        html_content = page.content()
        soup = BeautifulSoup(html_content, 'html.parser')
        
        name = page.title().split('|')[0].replace('Dell 日本', '').strip()
        price = extract_main_price(soup)
        image_url = get_image_url_from_source(html_content)
        description = extract_specs_ultimate(page, soup)
        genre = "laptop" if "laptop" in url_clean else "desktop"

        print(f" 📦 製品名 : {name}")
        print(f" 💰 価  格 : ¥{price:,}" if price > 0 else " 💰 価  格 : 価格不明")
        print(f" 📝 構成   : {description}")
        print(f" 🖼️ 画像URL: {image_url if image_url else '⚠️ 取得失敗'}")
        print(f" 🚀 残り   : {remaining}件")
        print("-" * 50)

        unique_id = "dell-" + hashlib.md5(url_clean.encode()).hexdigest()[:12]
        save_data = {
            'unique_id': unique_id, 'site_prefix': 'DELL', 'maker': 'Dell',
            'raw_genre': genre, 'unified_genre': genre, 'name': name,
            'price': price, 'url': url_clean, 'affiliate_url': FIXED_AFFILIATE_LINK,
            'image_url': image_url, 'description': description, 'is_active': True,
            'stock_status': '在庫あり' if price > 0 else '受注停止',
        }
        PCProduct.objects.update_or_create(unique_id=unique_id, defaults=save_data)
        return True

    except Exception as e:
        print(f" ❌ 解析失敗: {e}")
        return False

def run_crawler():
    target_categories = [
        "https://www.dell.com/ja-jp/shop/deals/top-pc-deals",
        "https://www.dell.com/ja-jp/shop/scc/sc/laptops",
        "https://www.dell.com/ja-jp/shop/scc/sc/desktops",
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # ユーザーエージェントを最新のものに
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            viewport={'width': 1280, 'height': 1200}
        )
        page = context.new_page()
        
        all_product_urls = set()
        print("⚙️  Bicstation Dellスクレイピング (最終・執念のスペック抽出版)...")

        for cat_url in target_categories:
            print(f"📂 カテゴリスキャン: {cat_url}")
            try:
                page.goto(cat_url, wait_until="networkidle", timeout=60000)
                page.wait_for_timeout(3000)
                # 商品リストの無限スクロールに対応
                for _ in range(10):
                    page.mouse.wheel(0, 1500)
                    page.wait_for_timeout(1000)
                    hrefs = page.evaluate('() => Array.from(document.querySelectorAll("a")).map(a => a.href)')
                    for h in hrefs:
                        if any(p in h for p in ["/spd/", "/pd/", "/pdp/"]):
                            all_product_urls.add(h.split('#')[0].split('?')[0].rstrip('/'))
                print(f"   📊 発見済みURL: {len(all_product_urls)}件")
            except Exception as e:
                print(f" ⚠️ スキャン失敗: {e}")
        
        url_list = sorted(list(all_product_urls))
        print(f"\n🚀 全 {len(url_list)}件の個別解析を開始します。\n" + "="*60)
        
        for i, url in enumerate(url_list):
            scrape_detail_page(page, url, i, len(url_list))
            # サーバー負荷軽減のためのランダムウェイト
            time.sleep(random.uniform(1.5, 2.5))
            
        browser.close()
        print(f"\n✨ すべての処理が完了しました。")

if __name__ == "__main__":
    run_crawler()