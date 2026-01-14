import os
import django
import json
import sys
import urllib.parse
import re

# --- Django設定 ---
# Dockerコンテナ内のパスに合わせて設定
sys.path.append('/usr/src/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import PCProduct

def import_hp_data():
    """
    HPのJSON(hp_results.json)をPCProductモデルへインポート。
    """
    # 💡 さきほど書き出したJSONのパス
    # コンテナ内から見たパスを指定してください
    json_path = "/usr/src/app/scrapers/src/json/hp_results.json"
    
    if not os.path.exists(json_path):
        print(f"❌ JSONファイルが見つかりません: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"📥 {len(data)}件のHPデータをインポート開始...")

    success_count = 0
    update_count = 0

    for item in data:
        # JSON側のキー名に合わせて抽出
        unique_id = f"HP_{item.get('unique_id')}"  # 接頭辞をつけて管理
        price = item.get('price', 0)
        
        # --- クレンジング ---
        # description内のHTMLタグ等を除去
        raw_description = item.get('description', '')
        clean_description = re.sub(r'<[^>]*?>', '', raw_description).strip()

        try:
            # unique_id をキーにして更新、または新規作成
            obj, created = PCProduct.objects.update_or_create(
                unique_id=unique_id,
                defaults={
                    'site_prefix': 'HP',
                    'maker': 'hp',
                    'name': item['name'],
                    'price': price,
                    'url': item.get('url'),           # オリジナルURL
                    'affiliate_url': item.get('url'), # Linkshareは元々アフィリンクなのでそのまま
                    'image_url': item.get('image_url', ''),
                    'description': clean_description,
                    'raw_genre': 'PC',
                    'unified_genre': 'PC',
                    'stock_status': '在庫あり',
                    'is_active': True,
                }
            )
            
            success_count += 1
            if not created:
                update_count += 1
                
        except Exception as e:
            print(f"   ❌ エラー ({unique_id}): {e}")

    print(f"\n✨ 完了報告")
    print(f"✅ 総処理件数: {success_count} 件")
    print(f"🔄 うち更新件数: {update_count} 件")
    print(f"💡 この後、運用ツール14番（属性自動紐付け）の実行を推奨します。")

if __name__ == "__main__":
    import_hp_data()