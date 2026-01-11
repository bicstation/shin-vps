import os
import django
import json
import sys

# --- Django設定 ---
# プロジェクトのルートディレクトリをパスに追加
sys.path.append('/usr/src/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import PCProduct

def import_acer_data():
    # 💡 あなたが置いたパスを指定
    json_path = "/usr/src/app/scrapers/src/json/acer_results.json"
    
    if not os.path.exists(json_path):
        print(f"❌ JSONファイルが見つかりません: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"📥 {len(data)}件のデータをインポート開始...")

    success_count = 0
    for item in data:
        # URLの末尾などから一意のIDを作成（重複登録防止）
        unique_id = f"ACR_{item['url'].split('/')[-1].replace('.html', '')}"
        
        try:
            PCProduct.objects.update_or_create(
                unique_id=unique_id,
                defaults={
                    'site_prefix': 'ACR',
                    'maker': 'Acer',
                    'name': item['name'],
                    'price': item['price'],
                    'url': item['url'],
                    'image_url': item.get('image_url', ''),
                    'description': item.get('description', ''), # 詳細スペックを丸ごと保存
                    'raw_genre': item['genre'],
                    'unified_genre': item['genre'],
                    'stock_status': '在庫あり' if item['price'] > 0 else '在庫切れ',
                    'is_active': True,
                }
            )
            success_count += 1
        except Exception as e:
            print(f"   ❌ エラー ({unique_id}): {e}")

    print(f"✨ 完了！ {success_count} 件のデータを更新/作成しました。")

if __name__ == "__main__":
    import_acer_data()