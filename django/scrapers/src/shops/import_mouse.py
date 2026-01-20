# -*- coding: utf-8 -*-
import os
import django
import json
import sys
import re
from django.utils.timezone import now

# --- Django設定 ---
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
    if not text:
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

def generate_mouse_unique_id(name, url):
    """
    商品名から型番を抽出。失敗時はURL末尾を使用。
    """
    match = re.search(r'([A-Z0-9]+-[A-Z0-9-]+)', name)
    if match:
        model_part = match.group(1)
    else:
        # URLの末尾（例: gmouse-b4i5u01sracaw101dec）からIDを抽出
        model_part = url.rstrip('/').split('/')[-1].replace('g', '', 1)
    return f"mouse_{model_part}"

def import_mouse_data():
    """
    マウスコンピューターのインポート処理
    AI解析データを各カラムへマッピングし、Descriptionに詳細をスラッシュ区切りで格納
    """
    json_path = "/usr/src/app/scrapers/src/json/mouse_results.json"
    
    if not os.path.exists(json_path):
        print(f"❌ JSONファイルが見つかりません: {json_path}")
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ JSON読み込みエラー: {e}")
        return

    print(f"📥 {len(data)}件のデータを処理中...")

    success_count = 0
    skip_count_price = 0
    skip_count_trash = 0
    monitor_count = 0

    for item in data:
        product_url = item.get('url', '')
        price = item.get('price', 0)
        name = item.get('name', '商品名不明')
        ai_data = item.get('ai_extracted_json', {})
        
        if not product_url:
            continue

        # 1. 固有ID生成
        unique_id = generate_mouse_unique_id(name, product_url)

        # 2. ジャンル判定
        raw_genre = item.get('genre', 'ノートブック')
        is_monitor = any(x in name.upper() for x in ["PROLITE", "G-MASTER", "IIYAMA", "液晶ディスプレイ"])
        
        if is_monitor:
            unified_genre = "monitor"
            monitor_count += 1
        elif "デスクトップ" in raw_genre:
            unified_genre = "desktop"
        elif "ノート" in raw_genre or "タブレット" in raw_genre:
            unified_genre = "notebook"
        else:
            unified_genre = "pc"

        # 3. 除外ロジック
        if price <= 1000: # 100円以下ではなく1000円以下をノイズと判定（マウスの相場考慮）
            skip_count_price += 1
            continue

        is_trash = any(x in name for x in ["ブラケット", "取付金具", "リサイクル券", "専用マウント", "保守"])
        if is_trash:
            skip_count_trash += 1
            continue

        # 4. 数値化マッピング
        ram_val = parse_gb_value(ai_data.get('ram'))
        storage_val = parse_gb_value(ai_data.get('storage'))
        
        # 5. Descriptionの構築（スラッシュ区切りで詳細を網羅）
        # AI抽出データを優先しつつ、不足分を補完
        spec_parts = [
            f"CPU: {ai_data.get('cpu', '不明')}",
            f"GPU: {ai_data.get('gpu', '不明')}",
            f"RAM: {ai_data.get('ram', '不明')}",
            f"Storage: {ai_data.get('storage', '不明')}",
            f"Display: {ai_data.get('screen_size', 'なし')}",
            f"Weight: {ai_data.get('weight', '不明')}"
        ]
        description_str = " / ".join(spec_parts)

        # 6. AI PC判定
        npu_exists = ai_data.get('npu_exists', False)
        # NPUフラグまたはCPU名からの推論
        is_ai_pc_flag = npu_exists or any(x in (ai_data.get('cpu') or "").upper() for x in ["CORE ULTRA", "RYZEN AI", "RYZEN 300", "RYZEN 9 8"])

        try:
            # DB更新または作成
            obj, created = PCProduct.objects.update_or_create(
                unique_id=unique_id,
                defaults={
                    'site_prefix': 'mouse',
                    'maker': 'mouse',
                    'name': name,
                    'price': price,
                    'url': product_url,
                    'image_url': item.get('image_url', ''),
                    'description': description_str, # スラッシュ区切りの詳細
                    'raw_genre': raw_genre,
                    'unified_genre': unified_genre,
                    
                    # --- 新規追加カラムへのマッピング ---
                    'memory_gb': ram_val,
                    'storage_gb': storage_val,
                    'cpu_model': ai_data.get('cpu'),
                    'gpu_model': ai_data.get('gpu'),
                    'display_info': ai_data.get('screen_size'),
                    'is_ai_pc': is_ai_pc_flag,
                    # 'last_spec_parsed_at': now(),
                    'last_spec_parsed_at': None,
                    
                    # ステータス管理
                    'stock_status': '在庫あり' if price > 0 else '受注停止中',
                    'is_active': True,
                    'updated_at': now(),
                }
            )
            success_count += 1
        except Exception as e:
            print(f"   ❌ エラー ({unique_id}): {e}")

    print(f"\n✨ インポート完了報告")
    print(f"----------------------------------------")
    print(f"✅ 成功（登録/更新）   : {success_count} 件")
    print(f"   (うちモニター数     : {monitor_count} 件)")
    print(f"⚠️ スキップ（低価格/無償）: {skip_count_price} 件")
    print(f"⚠️ スキップ（不要小物/保守）: {skip_count_trash} 件")
    print(f"----------------------------------------")

if __name__ == "__main__":
    import_mouse_data()