import os
import django
import json
import sys
import urllib.parse  # 💡 URLエンコード用にインポート

# --- Django設定 ---
sys.path.append('/usr/src/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import PCProduct

def import_acer_data():
    # 💡 パスを指定
    json_path = "/usr/src/app/scrapers/src/json/acer_results.json"
    
    # 💡 A8.net アフィリエイトベースURL (Acer専用)
    # 提示されたURLの末尾（a8ejpredirect=）に直リンクを結合する
    A8_BASE_URL = "https://px.a8.net/svt/ejp?a8mat=3Z0VI7+20OX42+5G54+BW0YB&a8ejpredirect="

    if not os.path.exists(json_path):
        print(f"❌ JSONファイルが見つかりません: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"📥 {len(data)}件のデータをインポート開始（アフィリエイトリンク生成込）...")

    success_count = 0
    for item in data:
        # URLの末尾から一意のIDを作成
        product_url = item['url']
        unique_id = f"ACR_{product_url.split('/')[-1].replace('.html', '')}"
        
        # 💡 アフィリエイトURLの生成
        # 直リンクをURLエンコードしてベースURLと結合
        encoded_url = urllib.parse.quote(product_url, safe='')
        affiliate_url = f"{A8_BASE_URL}{encoded_url}"
        
        try:
            PCProduct.objects.update_or_create(
                unique_id=unique_id,
                defaults={
                    'site_prefix': 'ACR',
                    'maker': 'Acer',
                    'name': item['name'],
                    'price': item['price'],
                    'url': product_url,              # オリジナルのURL
                    'affiliate_url': affiliate_url,  # ✨ A8.net経由のURL
                    'image_url': item.get('image_url', ''),
                    'description': item.get('description', ''),
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
    print(f"🔗 すべての商品に A8.net アフィリエイトリンクを設定しました。")

if __name__ == "__main__":
    import_acer_data()