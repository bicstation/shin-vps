import os
import django
import sys
import logging
import re
import csv
from django.utils import timezone
from typing import List, Dict, Any

# --- Django設定 ---
sys.path.append('/usr/src/app') # コンテナ内のパスに合わせて調整
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import BcLinkshareProduct, PCProduct, PCAttribute

class APISyncEngine:
    TSV_PATH = "/home/maya/dev/shin-vps/django/master_data/attributes.tsv"

    def __init__(self):
        self.attr_rules = self._load_attr_rules()

    def _load_attr_rules(self) -> List[Dict]:
        """TSVファイルを読み込んで判定ルールを作成する"""
        rules = []
        if not os.path.exists(self.TSV_PATH):
            print(f"⚠️ TSVファイルが見つかりません: {self.TSV_PATH}")
            return rules

        with open(self.TSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter='\t')
            for row in reader:
                keywords = [k.strip() for k in row['search_keywords'].split(',') if k.strip()]
                rules.append({
                    'slug': row['slug'],
                    'keywords': keywords,
                    'attr_type': row['attr_type']
                })
        print(f"📖 TSVから {len(rules)} 個の判定ルールを読み込みました")
        return rules

    def _determine_attributes(self, text: str) -> List[str]:
        """テキストから合致する全属性スラッグを抽出する"""
        matched_slugs = []
        if not text:
            return matched_slugs
            
        lower_text = text.lower()
        for rule in self.attr_rules:
            if any(kw.lower() in lower_text for kw in rule['keywords']):
                matched_slugs.append(rule['slug'])
        return matched_slugs

    def sync(self, mid: str, maker_slug: str, prefix: str = None):
        """
        BcLinkshareProductの生データを判定・仕訳してPCProductへ流し込む
        """
        prefix = prefix or maker_slug.upper()
        print(f"🔄 同期開始: MID={mid}, Maker={maker_slug}, Prefix={prefix}")

        # 1. 生データの取得
        raw_items = BcLinkshareProduct.objects.filter(mid=mid)
        total_count = raw_items.count()

        if total_count == 0:
            print(f"⚠️ MID: {mid} の生データが BcLinkshareProduct に見つかりません。")
            return

        success_count = 0
        created_count = 0

        for raw in raw_items:
            data = raw.api_response_json
            sku = data.get('sku')
            if not sku:
                continue

            # unique_id の生成
            unique_id = f"{prefix}_{sku}"
            
            # 商品名と説明文の結合（判定用）
            product_name = data.get('productname', '')
            raw_desc = data.get('description_short') or data.get('description_long', '') or ''
            search_text = f"{product_name} {raw_desc}"

            # --- TSVルールに基づく属性の判定 ---
            matched_slugs = self._determine_attributes(search_text)
            
            # PC形状(type-*)があればそれを優先して unified_genre にセット
            main_genre = "PC"
            for s in matched_slugs:
                if s.startswith('type-'):
                    main_genre = s
                    break

            # 価格の取得
            price_val = data.get('price', {}).get('value') or data.get('saleprice', {}).get('value', 0)

            try:
                # 2. PCProductへ保存
                obj, created = PCProduct.objects.update_or_create(
                    unique_id=unique_id,
                    defaults={
                        'site_prefix': prefix,
                        'maker': maker_slug,
                        'name': product_name,
                        'price': int(float(price_val)) if price_val else 0,
                        'url': data.get('linkurl'),
                        'affiliate_url': data.get('linkurl'),
                        'image_url': data.get('imageurl'),
                        'description': raw_desc[:500], # 長すぎる場合は制限
                        'raw_genre': 'PC',
                        'unified_genre': main_genre,
                        'stock_status': '在庫あり',
                        'is_active': True,
                        'affiliate_updated_at': timezone.now(),
                    }
                )

                # 3. 多対多のリレーション (PCAttribute) を一括更新
                if matched_slugs:
                    attrs = PCAttribute.objects.filter(slug__in=matched_slugs)
                    obj.attributes.set(attrs)

                success_count += 1
                if created:
                    created_count += 1
            except Exception as e:
                print(f"❌ エラー (SKU: {sku}): {e}")

        print(f"✅ 同期完了: {success_count}件処理 (新規作成: {created_count}件)")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='API Raw Data to PCProduct Sync Script')
    parser.add_argument('--mid', required=True, help='LinkShare Merchant ID')
    parser.add_argument('--maker', required=True, help='Maker Slug (e.g. asus, dell)')
    parser.add_argument('--prefix', required=False, help='Unique ID Prefix')
    args = parser.parse_args()

    engine = APISyncEngine()
    engine.sync(args.mid, args.maker, args.prefix)