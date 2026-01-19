# -*- coding: utf-8 -*-
import os
import django
import json
import sys
import urllib.parse
import re

# --- Django設定の修正 ---
# 1. プロジェクトのルート（manage.pyがある場所）を優先的に追加
BASE_DIR = '/usr/src/app'
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# 2. 環境変数の設定
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')

# 3. インポートエラー回避のため、特定のモジュールパスを明示的に指定
try:
    django.setup()
except django.core.exceptions.ImproperlyConfigured:
    # 既存のパス競合がある場合、一度スクレイパー関連をパスから外すなどの対策が必要
    # ここではセットアップを再試行
    import django.apps
    if not django.apps.apps.ready:
        django.setup()

from api.models import PCProduct

def generate_mouse_unique_id(name, url):
    """
    商品名から型番を抽出。失敗時はURL末尾を使用。
    """
    match = re.search(r'([A-Z0-9]+-[A-Z0-9-]+)', name)
    if match:
        model_part = match.group(1)
    else:
        model_part = url.rstrip('/').split('/')[-1].replace('g', '', 1)
    return f"mouse_{model_part}"

def import_mouse_data():
    """
    マウスコンピューターのインポート処理（モニター対応版）
    """
    # Dockerコンテナ内の絶対パスを指定
    json_path = "/usr/src/app/scrapers/src/json/mouse_results.json"
    
    VC_MYLINK_BASE = "" 

    if not os.path.exists(json_path):
        # ホスト側のパスも念のためフォールバックとして確認
        json_path = "/home/maya/dev/shin-vps/django/scrapers/src/json/mouse_results.json"
        if not os.path.exists(json_path):
            print(f"❌ JSONファイルが見つかりません。")
            return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"📥 {len(data)}件のデータを処理中...")

    success_count = 0
    skip_count_price = 0
    skip_count_trash = 0
    monitor_count = 0

    for item in data:
        product_url = item['url']
        price = item.get('price', 0)
        name = item.get('name', '商品名不明')
        raw_genre = item.get('raw_genre', 'PC')
        unified_genre = item.get('unified_genre', 'desktop') 

        unique_id = generate_mouse_unique_id(name, product_url)

        is_monitor = any(x in name.upper() for x in ["PROLITE", "G-MASTER", "IIYAMA", "液晶ディスプレイ"])
        if is_monitor:
            unified_genre = "monitor"
            monitor_count += 1

        if not is_monitor and price <= 100:
            skip_count_price += 1
            continue

        is_trash = any(x in name for x in ["ブラケット", "取付金具", "リサイクル券", "専用マウント"])
        if is_trash:
            skip_count_trash += 1
            continue

        if VC_MYLINK_BASE:
            encoded_url = urllib.parse.quote(product_url, safe='')
            affiliate_url = f"{VC_MYLINK_BASE}{encoded_url}"
        else:
            affiliate_url = product_url
        
        raw_description = item.get('description', 'スペック詳細は公式サイトをご確認ください')
        clean_description = re.sub(r'<br\s*/?>', '\n', raw_description)
        clean_description = re.sub(r'<[^>]*?>', '', clean_description)
        clean_description = clean_description.strip()

        try:
            PCProduct.objects.update_or_create(
                unique_id=unique_id,
                defaults={
                    'site_prefix': 'mouse',
                    'maker': 'mouse',
                    'name': name,
                    'price': price,
                    'url': product_url,
                    'affiliate_url': affiliate_url,
                    'image_url': item.get('image_url', ''),
                    'description': clean_description,
                    'raw_genre': raw_genre,
                    'unified_genre': unified_genre,
                    'stock_status': '在庫あり' if price > 1 else 'オープン価格',
                    'is_active': True,
                }
            )
            success_count += 1
        except Exception as e:
            print(f"   ❌ エラー ({unique_id}): {e}")

    print(f"\n✨ インポート完了報告")
    print(f"----------------------------------------")
    print(f"✅ 成功（登録/更新）   : {success_count} 件")
    print(f"   (うちモニター数     : {monitor_count} 件)")
    print(f"⚠️ スキップ（低価格PC） : {skip_count_price} 件")
    print(f"⚠️ スキップ（不要小物） : {skip_count_trash} 件")
    print(f"----------------------------------------")

if __name__ == "__main__":
    import_mouse_data()