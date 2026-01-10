import os
import django
import requests
from bs4 import BeautifulSoup
import hashlib
import time
import re
import urllib.parse
import html

# --- Django設定 ---
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()
from api.models.pc_products import PCProduct

MAKER_NAME = "FRONTIER"
SITE_PREFIX = "FRONTIER"
AFFILIATE_BASE_URL = "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3697471&pid=892466517&vc_url="

def frontier_text_fixer(text):
    """フロンティア特有の文字化けパターンを強制置換する"""
    if not text: return ""
    
    # 1. 数値文字参照 (&#xxxx;) を通常の文字に戻す
    text = html.unescape(text)
    
    # 2. フロンティアで頻発する文字化け置換マップ
    replace_map = {
        '紊': '最大',
        '潟': 'コア',
        '鴻': 'スレッド',
        'ｃ激': 'キャッシュ',
        '祉': 'プロセッサー',
        '泣': '', 
        'ｃ': 'キャ',
        '激': 'ッシュ',
    }
    
    for k, v in replace_map.items():
        text = text.replace(k, v)
        
    # 3. 余計な記号や非表示文字を掃除
    text = re.sub(r'[^\w\s\(\)\[\]\.\/\-ー：；、。]', '', text)
    # 4. 連続する空白を1つに
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()

def run_frontier_crawler():
    target_urls = [
        "https://www.frontier-direct.jp/direct/e/ej-sale/",
        "https://www.frontier-direct.jp/direct/g/g-desktop/"
    ]
    base_domain = "https://www.frontier-direct.jp"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    print(f"\n🚀 {SITE_PREFIX} 最終決戦クローラ（画像取得強化・文字化け修正）起動...")

    product_links = set()
    for start_url in target_urls:
        try:
            res = requests.get(start_url, headers=headers, timeout=30)
            res.encoding = 'EUC-JP'
            soup = BeautifulSoup(res.text, 'html.parser')
            links = soup.select('a[href*="/direct/g/g"]')
            for a in links:
                full_url = urllib.parse.urljoin(base_domain, a.get('href'))
                product_links.add(full_url)
        except Exception as e:
            print(f"⚠️ リスト取得失敗: {e}")

    total_saved = 0
    for p_url in product_links:
        try:
            time.sleep(1.2)
            p_res = requests.get(p_url, headers=headers, timeout=30)
            # EUC-JPでデコードしつつ、壊れた文字を無視
            decoded_html = p_res.content.decode('euc-jp', errors='ignore')
            p_soup = BeautifulSoup(decoded_html, 'html.parser')

            # --- A. 商品名 ---
            name_el = p_soup.find("input", id="hidden_goods_name")
            name = frontier_text_fixer(name_el["value"]) if name_el else "FRONTIER PC"

            # --- B. 価格 ---
            price = 0
            price_el = p_soup.select_one('.iw-price .iw-number')
            if price_el:
                price_val = re.sub(r'\D', '', price_el.get_text())
                if price_val: price = int(price_val)
            if price == 0: continue

            # --- C. 画像URL取得 (VPS対策強化) ---
            image_url = ""
            # 個別ページのスライドショー、メイン画像、一覧用の順に探す
            img_el = p_soup.select_one('.iw-goods-detail-slideshow-thumbnav img') or \
                     p_soup.select_one('#goods_image') or \
                     p_soup.select_one('.iw-goods-img img')
            
            if img_el:
                # data-src属性（Lazy Load）を優先し、なければsrc
                raw_img_path = img_el.get('data-src') or img_el.get('src') or img_el.get('data-lazy')
                if raw_img_path:
                    image_url = urllib.parse.urljoin(base_domain, raw_img_path)

            # --- D. スペック抽出 ---
            specs = {}
            for row in p_soup.select('.underLine'):
                k_el = row.select_one('.leftBox')
                v_el = row.select_one('.rightBox')
                if k_el and v_el:
                    k = frontier_text_fixer(k_el.get_text())
                    v = frontier_text_fixer(v_el.get_text(" "))
                    specs[k] = v

            cpu = specs.get("CPU", "確認中")
            gpu = specs.get("ビデオコントローラ", "標準構成")
            mem = specs.get("メモリ", "標準搭載")
            ssd = specs.get("ストレージ [1]", "標準搭載")
            
            spec_summary = f"{cpu} / {gpu} / {mem} / {ssd}"

            # --- E. 保存 ---
            uid = "frontier-" + hashlib.md5(p_url.encode()).hexdigest()[:12]
            # アフィリエイトURL生成
            encoded_url = urllib.parse.quote(p_url, safe='')
            aff_url = f"{AFFILIATE_BASE_URL}{encoded_url}"

            PCProduct.objects.update_or_create(
                unique_id=uid,
                defaults={
                    'site_prefix': SITE_PREFIX,
                    'maker': MAKER_NAME,
                    'name': name,
                    'price': price,
                    'url': p_url,
                    'affiliate_url': aff_url,
                    'image_url': image_url,
                    'description': spec_summary,
                    'is_active': True,
                    'stock_status': "在庫あり",
                    'raw_genre': 'gaming-pc',
                }
            )
            print(f"💎 [保存] {name} | {price:,}円 | 画像: {'OK' if image_url else 'NG'}")
            total_saved += 1

        except Exception as e:
            print(f"⚠️ 解析エラー ({p_url}): {e}")

    print(f"\n✨ 完了！ {total_saved} 件のデータを保存しました。")

if __name__ == "__main__":
    run_frontier_crawler()