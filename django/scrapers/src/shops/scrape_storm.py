import os
import django
import requests
from bs4 import BeautifulSoup
import hashlib
import time
import re
import urllib.parse

# --- Django設定 ---
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()
from api.models.pc_products import PCProduct

MAKER_NAME = "storm"
SITE_PREFIX = "STORM"
AFFILIATE_BASE_URL = "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3697471&pid=892466507&vc_url="

def run_storm_crawler():
    target_url = "https://www.stormst.com/products/list"
    base_domain = "https://www.stormst.com"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    print(f"\n🚀 {SITE_PREFIX} 高精度解析クローラ起動（正規表現修正版）...")

    try:
        res = requests.get(target_url, headers=headers, timeout=30)
        res.encoding = 'utf-8'
        soup = BeautifulSoup(res.text, 'html.parser')
        
        links = soup.select('a.product-list-btn-detail')
        product_urls = [urllib.parse.urljoin(base_domain, a.get('href')) for a in links]
        
        if not product_urls:
            print("⚠️ 商品リンクが見つかりません。")
            return

        print(f"📡 {len(product_urls)}件の詳細ページを巡回します。")

        total_saved = 0
        for p_url in product_urls:
            try:
                time.sleep(1.5)
                p_res = requests.get(p_url, headers=headers, timeout=30)
                p_res.encoding = 'utf-8'
                p_soup = BeautifulSoup(p_res.text, 'html.parser')

                # A. 商品名取得
                name_el = p_soup.find("meta", property="og:title")
                name = name_el["content"] if name_el else "STORM PC"

                # B. 価格取得
                price = 0
                price_meta = p_soup.find("meta", property="product:price:amount")
                if price_meta:
                    price = int(price_meta["content"])
                else:
                    price_el = p_soup.select_one('.ec-productRole__price')
                    if price_el: price = int(re.sub(r'\D', '', price_el.get_text()))

                # C. 画像URL取得
                image_url = ""
                img_meta = p_soup.find("meta", property="og:image")
                if img_meta:
                    image_url = img_meta["content"]

                # D. スペック抽出ロジック (正規表現エラー修正済み)
                full_text = p_soup.get_text()
                spec_data = {"CPU": "確認中", "GPU": "標準構成", "MEM": "標準搭載", "SSD": "標準搭載"}
                
                # 【修正点】ハイフンの扱いを修正 [\d\wー\-] としました
                cpu_m = re.search(r'(Intel Core|AMD Ryzen|Core i|Ryzen [3579])\s*[\d\wー\-]+', full_text, re.I)
                gpu_m = re.search(r'(GeForce|RTX|GTX|Radeon)\s*[\d\w]+(Ti|SUPER)?', full_text, re.I)
                mem_m = re.search(r'\d+GB\s*(DDR[45])?\s*(メモリ|Memory)', full_text)
                ssd_m = re.search(r'(\d+[G T]B)\s*(NVMe|SSD)', full_text)

                if cpu_m: spec_data["CPU"] = cpu_m.group(0)
                if gpu_m: spec_data["GPU"] = gpu_m.group(0)
                if mem_m: spec_data["MEM"] = mem_m.group(0)
                if ssd_m: spec_data["SSD"] = ssd_m.group(0)

                spec_summary = f"{spec_data['CPU']} / {spec_data['GPU']} / {spec_data['MEM']} / {spec_data['SSD']}"

                # E. アフィリエイトURL生成
                encoded_url = urllib.parse.quote(p_url, safe='')
                aff_url = f"{AFFILIATE_BASE_URL}{encoded_url}"
                
                uid = "storm-v2-" + hashlib.md5(p_url.encode()).hexdigest()[:12]

                print(f"💎 [解析] {name} | {price:,}円")

                PCProduct.objects.update_or_create(
                    unique_id=uid,
                    defaults={
                        'site_prefix': SITE_PREFIX,
                        'maker': 'STORM',
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
                total_saved += 1

            except Exception as e:
                print(f"⚠️ 解析エラー ({p_url}): {e}")
                continue

    except Exception as e:
        print(f"❌ 通信エラー: {e}")

    print(f"\n✨ 完了！ {total_saved} 件のSTORM製品を保存しました。")

if __name__ == "__main__":
    run_storm_crawler()