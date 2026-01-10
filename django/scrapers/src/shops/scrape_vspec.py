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

MAKER_NAME = "vspec"
SITE_PREFIX = "VSPEC"
AFFILIATE_BASE_URL = "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3697471&pid=892466407&vc_url="

def run_vspec_crawler():
    target_urls = [
        "https://vspec-bto.com/bto/bto-game.htm",
        "https://vspec-bto.com/bto/bto-hi.htm",
        "https://vspec-bto.com/bto/bto-light.htm",
        "https://vspec-bto.com/bto/bto-minimal-pc.htm",
        "https://vspec-bto.com/bto/bto-Coreultra-1851-pc.htm",
        "https://vspec-bto.com/bto/bto-ryzen-pc.htm"
    ]
    
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}

    print(f"\n🚀 {SITE_PREFIX} 【スペック高精度・抽出モード】実行中...")
    total_saved = 0

    for cat_url in target_urls:
        try:
            print(f"\n📡 カテゴリ解析: {cat_url}")
            res = requests.get(cat_url, headers=headers, timeout=30)
            res.encoding = 'shift_jis'
            soup = BeautifulSoup(res.text, 'html.parser')
            
            links = soup.find_all('a', href=re.compile(r'system_detail\.html'))
            product_urls = sorted(list(set([urllib.parse.urljoin(cat_url, a.get('href')) for a in links])))

            for p_url in product_urls:
                try:
                    time.sleep(1.0)
                    p_res = requests.get(p_url, headers=headers, timeout=30)
                    p_res.encoding = 'shift_jis'
                    p_soup = BeautifulSoup(p_res.text, 'html.parser')

                    # 商品名取得
                    name_el = p_soup.select_one('.sys-name-1col, h2, .sys-name')
                    name = name_el.get_text(strip=True) if name_el else "VSPEC BTO PC"
                    
                    # 価格取得
                    price = 0
                    price_targets = p_soup.select('.price, .sys-price, b, .sys-price-1col')
                    for target in price_targets:
                        text = target.get_text(strip=True)
                        if any(x in text for x in ['円', '￥', '\\']):
                            val = re.sub(r'\D', '', text)
                            if val and int(val) > 1000:
                                price = int(val)
                                break

                    # 画像取得
                    image_url = ""
                    img_el = p_soup.select_one('.sys-image img, #main_img, a[rel^="lightbox"] img')
                    if img_el:
                        image_url = urllib.parse.urljoin(p_url, img_el.get('src'))

                    # --- ⚙ スペック抽出ロジック強化 ---
                    spec_data = {"CPU": "未確認", "GPU": "標準構成", "MEM": "標準搭載", "SSD": "標準搭載"}
                    
                    rows = p_soup.find_all('tr')
                    for row in rows:
                        cells = row.find_all(['td', 'th'])
                        if len(cells) >= 2:
                            label = cells[0].get_text(strip=True)
                            val = cells[1].get_text(strip=True)
                            
                            # ラベルに特定の単語が含まれているかチェック (かつ、値が空や「無し」でない)
                            if val and val != "無し" and "選択して下さい" not in val:
                                if "CPU" in label.upper() and "ファン" not in label and "クーラー" not in label:
                                    spec_data["CPU"] = val
                                elif any(x in label for x in ["ビデオ", "グラフィック", "GPU"]):
                                    spec_data["GPU"] = val
                                elif "メモリ" in label:
                                    spec_data["MEM"] = val
                                elif any(x in label for x in ["SSD", "ストレージ", "HDD"]):
                                    spec_data["SSD"] = val

                    spec_summary = f"{spec_data['CPU']} / {spec_data['GPU']} / {spec_data['MEM']} / {spec_data['SSD']}"

                    # 🔊 コンソール実況
                    print(f"💎 [解析] {name[:30]}...")
                    print(f"   🖼 画像: {image_url}")
                    print(f"   ⚙ スペック: {spec_summary}")
                    print(f"   💰 価格: {price:,}円")
                    print("-" * 30)

                    # 保存処理
                    encoded_url = urllib.parse.quote(p_url, safe='')
                    aff_url = f"{AFFILIATE_BASE_URL}{encoded_url}"
                    uid = "vspec-v8-" + hashlib.md5(p_url.encode()).hexdigest()[:12]

                    PCProduct.objects.update_or_create(
                        unique_id=uid,
                        defaults={
                            'site_prefix': SITE_PREFIX, 'maker': MAKER_NAME,
                            'name': name, 'price': price, 'url': p_url,
                            'affiliate_url': aff_url, 'image_url': image_url,
                            'description': spec_summary,
                            'is_active': True, 'stock_status': "在庫あり",
                            'raw_genre': 'bto-pc',
                        }
                    )
                    total_saved += 1
                except: continue

        except Exception as e: print(f"❌ エラー: {e}")

    print(f"\n✨ 完了！ 合計 {total_saved} 件を「本物のスペック」で保存しました。")

if __name__ == "__main__":
    run_vspec_crawler()