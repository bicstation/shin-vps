import os
import django
import requests
from bs4 import BeautifulSoup
import hashlib
import time
import re
import urllib.parse
import json

# --- Django設定 ---
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
if not os.environ.get('DJANGO_SETTINGS_MODULE'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')

django.setup()
from api.models.pc_products import PCProduct

MAKER_NAME = "mouse"
SITE_PREFIX = "Mouse"
# アフィリエイトURLの生成用
AFFILIATE_BASE_URL = "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3697471&pid=892466407&vc_url="

def run_mouse_crawler():
    # offset=0(1ページ目), 40(2ページ目) と順番に回る
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    }
    
    session = requests.Session()
    total_saved = 0

    print(f"\n🚀 {SITE_PREFIX} 巡回開始...")

    for offset in [0, 40, 80]:
        list_url = f"https://www.mouse-jp.co.jp/store/goods/search.aspx?o={offset}&search=x&limit=40"
        print(f"📂 ページ解析中 (offset={offset})...")
        
        try:
            res = session.get(list_url, headers=headers, timeout=30)
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # 商品リンクを抽出
            links = []
            for a in soup.find_all('a', href=True):
                if '/store/g/g' in a['href']:
                    u = urllib.parse.urljoin(list_url, a['href']).split('?')[0]
                    if u not in links: links.append(u)

            for p_url in links:
                try:
                    time.sleep(1.5)
                    p_res = session.get(p_url, headers=headers, timeout=30)
                    p_soup = BeautifulSoup(p_res.text, 'html.parser')

                    # --- ① 商品名・価格・画像の取得 (JSON-LDから) ---
                    name, price, image_url = "", 0, ""
                    json_ld = p_soup.find("script", type="application/ld+json")
                    if json_ld:
                        data = json.loads(json_ld.string)
                        name = data.get("name", "")
                        price = int(data.get("offers", {}).get("price", 0))
                        image_url = data.get("image", [""])[0] if isinstance(data.get("image"), list) else data.get("image", "")

                    # --- ② 詳細スペックの抽出 (ここを強化！) ---
                    # マウスの個別ページにある「主な仕様」テーブルを狙い撃ちします
                    spec = {"CPU": "未確認", "GPU": "標準構成", "MEM": "標準", "SSD": "標準"}
                    
                    # ページ内の「m-product-main__spec-item」というクラスを全て探す
                    rows = p_soup.select('.m-product-main__spec-item')
                    for row in rows:
                        label = row.select_one('.m-product-main__spec-label')
                        value = row.select_one('.m-product-main__spec-text')
                        if label and value:
                            lbl_txt = label.get_text(strip=True)
                            val_txt = value.get_text(strip=True)
                            
                            if "CPU" in lbl_txt: spec["CPU"] = val_txt
                            elif "グラフィックス" in lbl_txt: spec["GPU"] = val_txt
                            elif "メモリ" in lbl_txt: spec["MEM"] = val_txt
                            elif "ストレージ" in lbl_txt: spec["SSD"] = val_txt

                    # --- ③ 保存 ---
                    clean_name = re.sub(r'マウスコンピューター|公式サイト|【.*】', '', name).strip()
                    uid = "mouse-v16-" + hashlib.md5(p_url.encode()).hexdigest()[:12]
                    description = f"{spec['CPU']} / {spec['GPU']} / {spec['MEM']} / {spec['SSD']}"

                    PCProduct.objects.update_or_create(
                        unique_id=uid,
                        defaults={
                            'site_prefix': SITE_PREFIX, 'maker': MAKER_NAME,
                            'name': clean_name, 'price': price, 'url': p_url,
                            'affiliate_url': f"{AFFILIATE_BASE_URL}{urllib.parse.quote(p_url, safe='')}",
                            'image_url': image_url, 'description': description,
                            'is_active': True, 'stock_status': "在庫あり", 'raw_genre': 'bto-pc',
                        }
                    )
                    print(f" ✅ {clean_name[:20]}... | {price:,}円")
                    print(f"    ⚙️ {description}")
                    total_saved += 1

                except Exception: continue

        except Exception as e:
            print(f"❌ エラー: {e}")

    print(f"\n✨ 完了！ {total_saved}件更新しました。")