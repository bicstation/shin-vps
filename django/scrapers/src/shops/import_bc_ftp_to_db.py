# /usr/src/app/scrapers/src/shops/import_bc_ftp_to_db.py
import os
import django
import sys
import json
import re
import ast
from decimal import Decimal
from django.utils import timezone
from django.db.models import Q

# --- Django設定 ---
sys.path.append('/usr/src/app') 
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models.linkshare_products import LinkshareProduct
from api.models.pc_products import PCProduct

def clean_price(val):
    if val is None: return 0
    if isinstance(val, (int, float, Decimal)): return int(val)
    s = re.sub(r'[^\d.]', '', str(val))
    try: return int(float(s)) if s else 0
    except: return 0

def sync_ftp_to_pc(mid=None, maker_slug=None, prefix=None):
    # --- 🌟 重要: site_prefix の NULL 対策 ---
    # 引数が渡されなかった場合、maker_slug から推測して必ず文字列を入れる
    current_maker = str(maker_slug or "unknown").lower()
    current_prefix = str(prefix or current_maker.upper())
    
    print(f"🔄 同期開始: MID={mid}, Maker={current_maker}, Prefix={current_prefix}")
    
    mid_str = str(mid).strip()
    
    # MIDのフィルタリング (文字列/数値両対応)
    query = LinkshareProduct.objects.filter(
        Q(merchant_id=mid_str) | Q(merchant_id=str(int(mid_str) if mid_str.isdigit() else 0)),
        is_active=True
    )
    
    if query.count() == 0:
        print(f"⚠️ 対象ゼロ (MID:{mid_str})")
        return

    success_count = 0
    created_count = 0
    for raw in query:
        try:
            # --- データパース (JSON/Python辞書両対応) ---
            data = {}
            raw_data = getattr(raw, 'raw_csv_data', None)
            
            if raw_data:
                if isinstance(raw_data, dict):
                    data = raw_data
                elif isinstance(raw_data, str):
                    try:
                        data = json.loads(raw_data)
                    except json.JSONDecodeError:
                        try:
                            data = ast.literal_eval(raw_data)
                        except:
                            pass

            sku = getattr(raw, 'sku', None)
            if not sku: continue

            # URL抽出 (getattrでAttributeErrorをガード)
            p_url = getattr(raw, 'product_url', None)
            b_url = getattr(raw, 'buy_url', None)
            target_url = p_url or b_url
            
            if not target_url and data:
                target_url = data.get('product_url') or data.get('buy_url') or data.get('link_url') or data.get('C6')

            if not target_url: continue

            # --- 🌟 DB保存: unique_id と site_prefix に確実に値を入れる ---
            unique_id = f"{current_prefix}_{sku}"
            
            obj, created = PCProduct.objects.update_or_create(
                unique_id=unique_id,
                defaults={
                    'site_prefix': current_prefix,
                    'maker': current_maker,
                    'name': getattr(raw, 'product_name', 'No Name'),
                    'price': clean_price(getattr(raw, 'price', 0)),
                    'url': target_url,
                    'affiliate_url': target_url,
                    'image_url': getattr(raw, 'image_url', "") or "",
                    'description': str(getattr(raw, 'product_name', ""))[:1000],
                    'raw_genre': 'PC',
                    'unified_genre': 'PC',
                    'stock_status': '在庫あり',
                    'is_active': True,
                    'affiliate_updated_at': timezone.now(),
                }
            )
            success_count += 1
            if created: created_count += 1
        except Exception as e:
            # ログ出力を詳細化してデバッグしやすく
            sku_label = getattr(raw, 'sku', '?')
            print(f"❌ Error SKU {sku_label}: {e}")

    print(f"✅ 同期完了: {success_count}件処理 (新規: {created_count}件)")

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--mid')
    parser.add_argument('--maker')
    parser.add_argument('--prefix')
    args = parser.parse_args()
    sync_ftp_to_pc(mid=args.mid, maker_slug=args.maker, prefix=args.prefix)