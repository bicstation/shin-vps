import os
import re
import json
import time
import random
import hashlib
import urllib.parse
import base64
import requests
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# ==========================================
# 🔑 1. 設定情報 (Bicstation 名義)
# ==========================================
LS_CLIENT_ID = os.environ.get('LS_CLIENT_ID', 'ybRFc2fz6l9Wc1rDgywekOuMfBRzOyUO')
LS_CLIENT_SECRET = os.environ.get('LS_CLIENT_SECRET', '2J72oAHLaIbSocWC2RaA2Wm3oZ7TuLhL')
LS_BC_SID = os.environ.get('LINKSHARE_BC_SID', '3273700')

DELL_MID = "1568114"
MEMBER_ID = "nNBA6GzaGrQ"

# ==========================================
# 🛰️ 2. LinkShare API クライアント
# ==========================================
class LinkShareAPIClient:
    BASE_URL = "https://api.linksynergy.com/"

    def __init__(self):
        self.access_token = None

    def _fetch_access_token(self):
        try:
            auth_string = f"{LS_CLIENT_ID}:{LS_CLIENT_SECRET}"
            token_key = base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')
            headers = {
                'Authorization': f'Bearer {token_key}',
                'Content-Type': 'application/x-www-form-urlencoded',
            }
            data = {'grant_type': 'password', 'scope': LS_BC_SID}
            response = requests.post(f"{self.BASE_URL}token", headers=headers, data=data, timeout=15)
            response.raise_for_status()
            self.access_token = response.json().get('access_token')
            return True
        except Exception as e:
            print(f"❌ APIトークン取得エラー: {e}")
            return False

    def get_link_by_search(self, product_name):
        if not self.access_token:
            if not self._fetch_access_token(): return None
        endpoint = f"{self.BASE_URL}productsearch/1.0"
        headers = {'Authorization': f'Bearer {self.access_token}'}
        params = {'keyword': product_name, 'mid': DELL_MID, 'max': 1}
        try:
            response = requests.get(endpoint, headers=headers, params=params, timeout=10)
            if response.status_code == 200:
                from xml.etree import ElementTree as ET
                root = ET.fromstring(response.text)
                return root.findtext('.//linkurl')
        except: pass
        return None

ls_api = LinkShareAPIClient()

# ==========================================
# 🛠️ 3. 補助関数 (ロジック強化版)
# ==========================================
def get_refined_genre(url, name):
    text = (url + " " + name).lower()
    if any(k in text for k in ["monitor", "モニター", "display"]): return "monitor"
    if any(k in text for k in ["alienware", "gaming", "ゲーミング"]): return "gaming_pc"
    if any(k in text for k in ["laptop", "ノートパソコン", "inspiron", "xps"]): return "laptop"
    if any(k in text for k in ["desktop", "デスクトップ", "optiplex"]): return "desktop"
    return "accessories"

def get_fallback_link(product_url):
    encoded_url = urllib.parse.quote(product_url, safe='')
    return f"https://click.linksynergy.com/link?id={MEMBER_ID}&offerid={DELL_MID}.1&type=15&murl={encoded_url}"

def extract_correct_price(soup):
    prices = []
    scripts = soup.find_all('script', type='application/ld+json')
    for script in scripts:
        try:
            data = json.loads(script.string)
            items = data if isinstance(data, list) else [data]
            for item in items:
                if item.get('@type') == 'Product':
                    offers = item.get('offers')
                    if offers:
                        offer_list = offers if isinstance(offers, list) else [offers]
                        for off in offer_list:
                            p = off.get('price')
                            if p: prices.append(int(float(str(p).replace(',', ''))))
        except: continue
    price_elements = soup.select('[data-testid="shared-ps-dell-price"], .ps-dell-price, .dell-price')
    for el in price_elements:
        p_text = re.sub(r'[^\d]', '', el.get_text())
        if p_text: prices.append(int(p_text))
    valid_prices = [p for p in prices if p > 30000]
    return min(valid_prices) if valid_prices else (max(prices) if prices else 0)

def extract_specs(soup):
    specs = {'cpu': '未検出', 'mem': '未検出', 'ssd': '未検出', 'gpu': '未検出', 'others': []}
    content_text = soup.get_text(separator=' ', strip=True)

    # 1. CPU
    cpu_match = re.search(r'(第\d+世代\s*)?(インテル®?\s*Core™?|AMD\s*Ryzen™?|Snapdragon®?)\s*[^\s,、/|]+', content_text, re.I)
    if cpu_match: specs['cpu'] = cpu_match.group().strip()

    # 2. メモリ
    mem_match = re.search(r'(\d+GB)\s*(LPDDR\d*x?|DDR\d*)\s*(\d+MT/s)?', content_text)
    if not mem_match: mem_match = re.search(r'\d+GB\s*(?=メモリ|メモリー|RAM)', content_text)
    if mem_match: specs['mem'] = mem_match.group().strip()

    # 3. SSD
    ssd_match = re.search(r'(\d+GB|\d+TB)\s*(M\.2\s*)?(PCIe\s*)?NVMe\s*SSD', content_text, re.I)
    if ssd_match: specs['ssd'] = ssd_match.group().strip()

    # 4. GPU
    gpu_match = re.search(r'(NVIDIA®?\s*GeForce\s*RTX™?\s*\d+|AMD\s*Radeon™?|インテル®?\s*Arc™?|インテル®?\s*グラフィックス)[^\s,、/|]*', content_text, re.I)
    if gpu_match: specs['gpu'] = gpu_match.group().strip()

    # 5. その他
    if "2-in-1" in content_text: specs['others'].append("2-in-1")
    os_match = re.search(r'Windows\s*11\s*(Home|Pro)', content_text)
    if os_match: specs['others'].append(os_match.group())
    display_match = re.search(r'(\d{2}(\.\d)?インチ)', content_text)
    if display_match: specs['others'].append(display_match.group(1))

    others_str = " / ".join(specs['others']) if specs['others'] else "Dell公式"
    full_desc = f"{specs['cpu']} / {specs['mem']} / {specs['ssd']} / {specs['gpu']} / {others_str}"
    return full_desc, specs

# ==========================================
# 🚀 4. メイン処理
# ==========================================
def scrape_detail_page(page, url, current_index, total_count):
    url_clean = url.split('#')[0].split('?')[0].rstrip('/')
    try:
        page.goto(url_clean, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(2000)
        soup = BeautifulSoup(page.content(), 'html.parser')
        name = page.title().split('|')[0].replace('Dell 日本', '').strip()
        price = extract_correct_price(soup)
        description, s_dict = extract_specs(soup)

        print(f"\n🔎 [{current_index + 1}/{total_count}] -------------------")
        print(f"  📦 製品名: {name}")
        print(f"  💰 価  格: ¥{price:,}")
        print(f"  ⚙️  CPU  : {s_dict['cpu']}")
        print(f"  💾 メモリ: {s_dict['mem']}")
        print(f"  💿 SSD  : {s_dict['ssd']}")
        print(f"  🎮 GPU  : {s_dict['gpu']}")
        print(f"  📝 構成  : {description}")

        image_url = ""
        img_handle = page.query_selector('img[data-testid="shared-ps-image"]')
        if img_handle:
            src = img_handle.get_attribute("src")
            image_url = "https:" + src if src and src.startswith('//') else src

        affiliate_url = ls_api.get_link_by_search(name) or get_fallback_link(url_clean)

        return {
            'unique_id': "dell-" + hashlib.md5(url_clean.encode()).hexdigest()[:12],
            'maker': 'Dell',
            'genre': get_refined_genre(url_clean, name),
            'name': name,
            'price': price,
            'url': url_clean,
            'affiliate_url': affiliate_url,
            'image_url': image_url,
            'description': description
        }
    except Exception as e:
        print(f"❌ ページエラー: {url} -> {e}")
        return None

def run_crawler():
    target_categories = [
        "https://www.dell.com/ja-jp/shop/deals/top-pc-deals",
        "https://www.dell.com/ja-jp/shop/scc/sc/laptops",
        "https://www.dell.com/ja-jp/shop/scc/sc/desktops",
    ]
    all_results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={'width': 1920, 'height': 1080}
        )
        page = context.new_page()
        
        all_product_urls = set()
        for cat_url in target_categories:
            print(f"📂 カテゴリスキャン中: {cat_url}")
            success = False
            for attempt in range(2): # 2回リトライ
                try:
                    page.goto(cat_url, wait_until="load", timeout=60000)
                    # 製品グリッドが表示されるまで待機
                    page.wait_for_selector('a[href*="/shop/"]', timeout=15000)
                    
                    # 確実に全製品を読み込ませるための深いスクロール
                    for _ in range(8): 
                        page.evaluate("window.scrollBy(0, 800)")
                        page.wait_for_timeout(600)
                    
                    hrefs = page.eval_on_selector_all('a[href*="/shop/"]', 'els => els.map(e => e.href)')
                    count_before = len(all_product_urls)
                    for h in hrefs:
                        if any(p in h for p in ["spd", "pdp", "pd"]):
                            all_product_urls.add(h.split('?')[0].split('#')[0].rstrip('/'))
                    
                    print(f"  ✅ {len(all_product_urls) - count_before} 件のURLを新規発見")
                    success = True
                    break
                except Exception as e:
                    print(f"  ⚠️ 試行 {attempt+1} 失敗: {cat_url}")
                    page.wait_for_timeout(2000)
            
            if not success:
                print(f"  ❌ カテゴリ取得をスキップします: {cat_url}")
        
        url_list = sorted(list(all_product_urls))
        print(f"\n🚀 合計 {len(url_list)} 件の製品スクレイピングを開始します...")
        
        for i, url in enumerate(url_list): 
            data = scrape_detail_page(page, url, i, len(url_list))
            if data: all_results.append(data)
            time.sleep(random.uniform(1.5, 3.0)) # BAN防止のため少し長めに待機
            
        browser.close()

    with open("dell_data.json", 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=4)
    print(f"\n✅ すべて完了！ 'dell_data.json' に {len(all_results)} 件保存しました。")

if __name__ == "__main__":
    run_crawler()