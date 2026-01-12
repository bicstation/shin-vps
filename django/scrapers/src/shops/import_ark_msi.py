import os
import django
import json
import sys
import urllib.parse
import re

# --- Django設定 ---
sys.path.append('/usr/src/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import PCProduct

def import_msi_data():
    # 💡 コンテナ内の絶対パス
    json_path = "/usr/src/app/scrapers/src/json/msi_results.json"
    
    # 💡 バリューコマース アフィリエイトベースURL
    VC_BASE_URL = "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3697471&pid=892466351&vc_url="

    if not os.path.exists(json_path):
        print(f"❌ JSONファイルが見つかりません: {json_path}")
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ JSON読み込みエラー: {e}")
        return

    print(f"📥 MSI製品 {len(data)}件のインポートを開始...")

    success_count = 0
    for item in data:
        product_url = item.get('url', '')
        if not product_url: continue

        # 一意のIDを生成 (URL末尾のIDを利用)
        url_path = product_url.rstrip('/')
        product_id = url_path.split('/')[-1]
        unique_id = f"MSI_ARK_{product_id}"
        
        # アフィリエイトURL生成
        encoded_url = urllib.parse.quote(product_url, safe='')
        affiliate_url = f"{VC_BASE_URL}{encoded_url}"
        
        # 説明文の整形
        description = item.get('description', '')
        description = re.sub(r"参照値ナシ", "", description)
        description = re.sub(r"（MSIはビジネスに.*?勧めします）", "", description).strip()

        try:
            price = int(item.get('price', 0))
            PCProduct.objects.update_or_create(
                unique_id=unique_id,
                defaults={
                    'site_prefix': 'ARK',
                    'maker': 'MSI',
                    'name': item.get('name', ''),
                    'price': price,
                    'url': product_url,
                    'affiliate_url': affiliate_url,
                    'image_url': item.get('image_url', ''),
                    'description': description,
                    'raw_genre': item.get('genre', 'laptop'),
                    'unified_genre': item.get('genre', 'laptop'),
                    'stock_status': '在庫あり' if price > 0 else '在庫切れ',
                    'is_active': True,
                }
            )
            success_count += 1
        except Exception as e:
            print(f"   ❌ 保存エラー ({unique_id}): {e}")

    print(f"✨ 完了: {success_count} 件を同期しました。")

if __name__ == "__main__":
    import_msi_data()