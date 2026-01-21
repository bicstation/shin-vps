import os
import django
import requests
from bs4 import BeautifulSoup
import hashlib
import time
import re
import urllib.parse
import json
from django.utils import timezone

# --- Django設定 ---
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
if not os.environ.get('DJANGO_SETTINGS_MODULE'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')

django.setup()
from api.models import BcLinkshareProduct, PCProduct

MAKER_NAME = "asus"
SITE_PREFIX = "ASUS"
MID = "43708"

def run_asus_detail_scraper():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    }
    
    session = requests.Session()
    # 1. APIから取得済みの生データを取得
    raw_products = BcLinkshareProduct.objects.filter(mid=MID)
    total_saved = 0

    print(f"\n🚀 {SITE_PREFIX} 詳細スクレイピング開始 (対象: {raw_products.count()}件)...")

    for raw in raw_products:
        data = raw.api_response_json
        affiliate_url = data.get('linkurl')
        sku = data.get('sku')
        
        if not affiliate_url or not sku:
            continue

        # --- ① LinkShareURLから生のASUS URLを抽出 ---
        # murl= 以降をデコードする
        match = re.search(r'murl=([^&]+)', affiliate_url)
        if match:
            p_url = urllib.parse.unquote(match.group(1))
        else:
            p_url = affiliate_url

        print(f"🔎 解析中: {sku} -> {p_url}")

        try:
            time.sleep(1.0)
            res = session.get(p_url, headers=headers, timeout=30)
            res.encoding = 'utf-8'
            soup = BeautifulSoup(res.text, 'html.parser')

            # --- ② スペック情報の抽出 (ASUS Storeの構造に合わせる) ---
            # ASUSのページから「インチ」「CPU」「OS」「メモリ」「ストレージ」が含まれるテキストを抽出
            spec = {"CPU": "不明", "MEM": "標準", "SSD": "標準", "DISP": "不明"}
            
            # ASUS Storeの仕様セクション（product-info-main 等）からテキストを探す
            main_content = soup.select_one('.product-info-main')
            if not main_content:
                main_content = soup.select_one('.product.info.detailed')

            if main_content:
                text = main_content.get_text(separator=" ", strip=True)
                
                # 正規表現で各項目を抽出（あなたが貼ってくれたフォーマットに対応）
                cpu_match = re.search(r'CPU\s*:\s*([^/|\n]+)', text)
                mem_match = re.search(r'メモリ\s*:\s*([^/|\n]+)', text)
                ssd_match = re.search(r'ストレージ\s*:\s*([^/|\n]+)', text)
                disp_match = re.search(r'インチ\s*:\s*([^/|\n]+)', text)

                if cpu_match: spec["CPU"] = cpu_match.group(1).strip()
                if mem_match: spec["MEM"] = mem_match.group(1).strip()
                if ssd_match: spec["SSD"] = ssd_match.group(1).strip()
                if disp_match: spec["DISP"] = disp_match.group(1).strip()

            # --- ③ 保存 ---
            name = data.get("productname", sku)
            price = int(data.get("price", {}).get("value", 0))
            image_url = data.get("imageurl", "")
            
            # descriptionにリッチな情報を詰め込む
            description = f"{spec['DISP']} / {spec['CPU']} / {spec['MEM']} / {spec['SSD']}"
            unique_id = f"{SITE_PREFIX}_{sku}"

            obj, created = PCProduct.objects.update_or_create(
                unique_id=unique_id,
                defaults={
                    'site_prefix': SITE_PREFIX,
                    'maker': MAKER_NAME,
                    'name': name,
                    'price': price,
                    'url': p_url,
                    'affiliate_url': affiliate_url,
                    'image_url': image_url,
                    'description': description,
                    'is_active': True,
                    'stock_status': "在庫あり",
                    'raw_genre': 'PC',
                    'unified_genre': 'PC',
                    'affiliate_updated_at': timezone.now(),
                }
            )
            
            print(f" ✅ {'[新]' if created else '[更新]'} {sku} | {price:,}円")
            print(f"    ⚙️ {description}")
            total_saved += 1

        except Exception as e:
            print(f" ❌ エラー ({sku}): {e}")
            continue

    print(f"\n✨ 完了！ {total_saved}件のASUS製品をリッチデータ化しました。")

if __name__ == "__main__":
    run_asus_detail_scraper()