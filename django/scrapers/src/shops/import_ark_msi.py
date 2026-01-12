import os
import django
import json
import sys
import urllib.parse
import re
from django.db import transaction

# --- Django設定 ---
sys.path.append('/usr/src/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import PCProduct

def clean_price(price_val):
    if isinstance(price_val, int): return price_val
    if not price_val: return 0
    nums = re.sub(r'\D', '', str(price_val))
    return int(nums) if nums else 0

def extract_ark_id(url):
    """
    URLからアークの商品コード（数字8桁など）を抽出する
    例: https://www.ark-pc.co.jp/i/20107657/ -> 20107657
    """
    match = re.search(r'/i/(\d+)', url)
    if match:
        return match.group(1)
    return None

def import_msi_data():
    json_path = "/usr/src/app/scrapers/src/json/msi_results.json"
    # バリューコマースのアフィリエイトベース
    VC_BASE_URL = "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3697471&pid=892466351&vc_url="

    if not os.path.exists(json_path):
        print(f"❌ JSONが見つかりません: {json_path}")
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ JSON読み込みエラー: {e}")
        return

    print(f"📥 アーク(MSI)製品 {len(data)}件のインポートを開始...")

    success_count = 0
    with transaction.atomic():
        for item in data:
            product_url = item.get('url', '')
            ark_id = extract_ark_id(product_url)
            
            if not ark_id:
                # URLからIDが取れない場合はスキップ
                continue

            unique_id = f"ARK_MSI_{ark_id}"
            price = clean_price(item.get('price', 0))
            
            # アフィリエイトURL生成
            encoded_url = urllib.parse.quote(product_url, safe='')
            affiliate_url = f"{VC_BASE_URL}{encoded_url}"
            
            # 説明文（製品概要）の取得
            raw_specs = item.get('raw_specs', {})
            description = raw_specs.get('製品概要', item.get('blog_display_specs', ''))
            
            # 💡 データの整形（不要な文言をカット）
            description = re.sub(r"の詳細、仕様、価格動向、関連アイテムがわかる商品販売ページです。", "", description)
            description = re.sub(r"のご購入ならアークオンラインストアにおまかせください！.*", "", description)

            try:
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
                        'description': description.strip(),
                        'raw_genre': 'parts', # デフォルトをパーツに（後で調整可）
                        'unified_genre': 'parts',
                        'stock_status': '在庫あり' if price > 0 else '在庫切れ',
                        'is_active': True,
                    }
                )
                success_count += 1
            except Exception as e:
                print(f"   ❌ 保存エラー ({unique_id}): {e}")

    print(f"✨ 完了: {success_count} 件を正常に同期しました。")

if __name__ == "__main__":
    import_msi_data()