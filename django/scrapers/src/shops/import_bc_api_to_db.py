import os
import django
import sys
import logging
import re
from django.utils import timezone

# --- Django設定 ---
sys.path.append('/usr/src/app') # コンテナ内のパス
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import BcLinkshareProduct, PCProduct

def sync_linkshare_to_pc(mid, maker_slug, prefix=None):
    """
    BcLinkshareProductの生データをPCProductへ流し込む
    """
    prefix = prefix or maker_slug.upper()
    print(f"🔄 同期開始: MID={mid}, Maker={maker_slug}, Prefix={prefix}")

    # 1. 生データの取得
    raw_items = BcLinkshareProduct.objects.filter(mid=mid)
    total_count = raw_items.count()

    if total_count == 0:
        print(f"⚠️ MID: {mid} の生データが見つかりません。")
        return

    success_count = 0
    created_count = 0

    for raw in raw_items:
        data = raw.api_response_json
        sku = data.get('sku')
        if not sku: continue

        # 2. unique_id の生成（メーカー重複回避）
        unique_id = f"{prefix}_{sku}"
        
        # 価格の取得ロジック
        price_val = data.get('price', {}).get('value') or data.get('saleprice', {}).get('value', 0)

        try:
            # PCProductへ保存（save()メソッドでURLハイフン化が走る前提）
            obj, created = PCProduct.objects.update_or_create(
                unique_id=unique_id,
                defaults={
                    'site_prefix': prefix,
                    'maker': maker_slug,
                    'name': data.get('productname'),
                    'price': int(float(price_val)) if price_val else 0,
                    'url': data.get('linkurl'),  # オリジナルURL
                    'affiliate_url': data.get('linkurl'),
                    'image_url': data.get('imageurl'),
                    'description': data.get('description_short') or data.get('description_long', '')[:200],
                    'raw_genre': 'PC',
                    'unified_genre': 'PC',
                    'stock_status': '在庫あり',
                    'is_active': True,
                    'affiliate_updated_at': timezone.now(),
                }
            )
            success_count += 1
            if created:
                created_count += 1
        except Exception as e:
            print(f"❌ エラー (SKU: {sku}): {e}")

    print(f"✅ 完了: {success_count}件処理 (新規作成: {created_count}件)")

if __name__ == "__main__":
    # 実行時に引数を取るようにしても良いですが、まずはASUS(43708)で固定テスト
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--mid', required=True)
    parser.add_argument('--maker', required=True)
    args = parser.parse_args()

    sync_linkshare_to_pc(args.mid, args.maker)