# -*- coding: utf-8 -*-
import os
import django
import json
import sys
import re
from django.utils.timezone import now

# --- Django設定 ---
# コンテナ内のパスに合わせて調整
BASE_DIR = '/usr/src/app'
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')

try:
    django.setup()
except django.core.exceptions.ImproperlyConfigured:
    import django.apps
    if not django.apps.apps.ready:
        django.setup()

from api.models import PCProduct

def parse_gb_value(text):
    """
    '32GB (16GBx2)' -> 32
    '1TB (NVMe)' -> 1000
    などの文字列を数値(GB)に変換する
    """
    if not text or text == "N/A":
        return None
    # 全角英数を半角に変換し、大文字化
    text = str(text).translate(str.maketrans('０１２３４５６７８９ＧＢＴＢ', '0123456789GBTB')).upper()
    
    # 最初の数値部分と単位を取得
    match = re.search(r'(\d+)\s*(GB|TB)', text)
    if not match:
        return None
    
    val = int(match.group(1))
    unit = match.group(2)
    
    if unit == 'TB':
        return val * 1000
    return val

def extract_spec_from_description(description):
    """
    アークの description 形式からスペックを抽出
    例: "AMD Ryzen 7 9700X / GeForce RTX 5070 / 32GB (16GBx2) / 1TB - Kingston / NPU:False"
    """
    specs = {
        'cpu': None,
        'gpu': None,
        'ram': None,
        'storage': None,
        'is_ai_pc': False
    }
    if not description:
        return specs

    parts = [p.strip() for p in description.split('/')]
    
    # 1番目: CPU
    if len(parts) > 0:
        specs['cpu'] = parts[0]
        # AI PC判定
        if any(x in parts[0].upper() for x in ["CORE ULTRA", "RYZEN AI", "RYZEN 9 8", "RYZEN 7 8", "STRIX POINT"]):
            specs['is_ai_pc'] = True
            
    # 2番目: GPU
    if len(parts) > 1:
        specs['gpu'] = parts[1]
        
    # 3番目: RAM
    if len(parts) > 2:
        specs['ram'] = parts[2]
        
    # 4番目: Storage
    if len(parts) > 3:
        specs['storage'] = parts[3]

    # NPUフラグチェック
    if "NPU:True" in description:
        specs['is_ai_pc'] = True

    return specs

def import_ark_data():
    """
    パソコンショップアークのインポート処理
    """
    # コンテナ内から見た絶対パス
    json_path = "/usr/src/app/scrapers/src/json/ark_results.json"
    
    if not os.path.exists(json_path):
        print(f"❌ JSONファイルが見つかりません: {json_path}")
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ JSON読み込みエラー: {e}")
        return

    print(f"📥 アークのデータを処理中: {len(data)}件")

    success_count = 0
    skip_count_price = 0
    skip_count_trash = 0
    part_count = 0

    for item in data:
        unique_id = item.get('unique_id')
        product_url = item.get('url', '')
        price = item.get('price', 0)
        name = item.get('name', '商品名不明')
        description = item.get('description', '')
        
        if not unique_id or not product_url:
            continue

        # 1. 除外ロジック
        # 価格が安すぎるもの（周辺機器、メモリ単体など）
        if price <= 5000:
            # 5000円以下はPC本体ではない可能性が高いためパーツとしてカウントしてスキップ可（運用に合わせる）
            if "DDR" in description or "GB" in name:
                part_count += 1
                skip_count_trash += 1
                continue
            skip_count_price += 1
            continue

        # 明らかなパーツ・小物を除外
        is_trash = any(x in name for x in ["ブラケット", "取付金具", "リサイクル券", "保守", "延長保証", "変換アダプタ"])
        if is_trash:
            skip_count_trash += 1
            continue

        # 2. スペック抽出
        specs = extract_spec_from_description(description)
        ram_val = parse_gb_value(specs['ram'])
        storage_val = parse_gb_value(specs['storage'])

        # 3. ジャンル判定
        raw_genre = item.get('genre', 'デスクトップ')
        if "デスクトップ" in raw_genre or "ゲーミング" in name:
            unified_genre = "desktop"
        elif "ノート" in raw_genre:
            unified_genre = "notebook"
        else:
            unified_genre = "pc"

        try:
            # DB更新または作成
            obj, created = PCProduct.objects.update_or_create(
                unique_id=unique_id,
                defaults={
                    'site_prefix': 'ark',
                    'maker': 'ark',
                    'name': name,
                    'price': price,
                    'url': product_url,
                    'image_url': item.get('image_url', ''),
                    'description': description, 
                    'raw_genre': raw_genre,
                    'unified_genre': unified_genre,
                    
                    # 抽出スペックのマッピング
                    'memory_gb': ram_val,
                    'storage_gb': storage_val,
                    'cpu_model': specs['cpu'],
                    'gpu_model': specs['gpu'],
                    'display_info': "デスクトップ（別売）" if unified_genre == "desktop" else None,
                    'is_ai_pc': specs['is_ai_pc'],
                    
                    # 解析待ち状態にする
                    'last_spec_parsed_at': None,
                    
                    # ステータス管理
                    'stock_status': '在庫あり' if price > 0 else '取り寄せ',
                    'is_active': True,
                    'updated_at': now(),
                }
            )
            success_count += 1
        except Exception as e:
            print(f"   ❌ DBエラー ({unique_id}): {e}")

    print(f"\n✨ アーク インポート完了報告")
    print(f"----------------------------------------")
    print(f"✅ 成功（登録/更新）   : {success_count} 件")
    print(f"⚠️ パーツ類・小物除外 : {skip_count_trash} 件")
    print(f"⚠️ 低価格スキップ     : {skip_count_price} 件")
    print(f"----------------------------------------")

if __name__ == "__main__":
    import_ark_data()