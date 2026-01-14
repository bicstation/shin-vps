import json
import re
import os
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import BcLinkshareProduct

class Command(BaseCommand):
    help = 'API(BcLinkshareProduct)からデータを抽出し、マッピング用JSONとして保存します。'

    def add_arguments(self, parser):
        # デフォルトはHPですが、引数で他メーカーも指定可能です
        parser.add_argument('--maker', type=str, default='HP', help='対象メーカー名 (例: HP, DELL, mouse)')
        parser.add_argument('--output', type=str, help='出力先のフルパス (指定なしで自動生成)')

    def _extract_price(self, item):
        """価格データをクリーンな整数に変換"""
        p_data = item.get('saleprice') or item.get('price')
        if not p_data: return 0
        val_str = p_data.get('value') or p_data.get('#text') or p_data.get('text') or '0'
        if isinstance(p_data, dict) and not val_str:
             val_str = '0'
        try:
            # 198,000.00 のような文字列から数字以外を削除して整数へ
            clean_price = re.sub(r'[^\d]', '', str(val_str).split('.')[0])
            return int(clean_price) if clean_price else 0
        except:
            return 0

    def handle(self, *args, **options):
        target_maker = options['maker']
        
        # 保存先パスの決定
        base_dir = '/mnt/c/dev/SHIN-VPS/django/scrapers/src/json/'
        default_filename = f"{target_maker.lower()}_results.json"
        output_path = options['output'] or os.path.join(base_dir, default_filename)

        self.stdout.write(self.style.NOTICE(f"--- {target_maker} データ抽出・マッピング開始 ---"))

        # 保存先ディレクトリの存在確認（なければ作成）
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # 1. API生データから該当メーカーをフィルタリング
        queryset = BcLinkshareProduct.objects.filter(
            api_response_json__merchantname__icontains=target_maker
        )

        results = []
        for entry in queryset:
            item = entry.api_response_json or {}
            
            name = item.get('productname', '')
            if not name:
                continue

            # 2. PCProductテーブルのカラムを意識したマッピング構造の作成
            # descriptionは属性判定(14番)の肝になるため、情報を統合
            short_desc = item.get('productdescription', '')
            long_desc = item.get('description', '')
            full_description = f"{short_desc} {long_desc}".strip()
            
            # 3. 識別子(unique_id)の生成
            # SKUから末尾の枝番を除去して、カタログ上の同一モデルを特定しやすくします
            raw_sku = str(item.get('sku') or '').strip()
            unique_id = raw_sku.replace('-md', '').split('-')[0].strip()

            # 4. JSON構造の構築 (提示されたサンプル形式に準拠)
            product_map = {
                "unique_id": unique_id,           # DBマッピング時のキー
                "name": name,                     # 製品名
                "description": full_description,  # 属性マッピング(14番)用
                "url": item.get('linkurl', ''),   # アフィリエイトURL
                "price": self._extract_price(item), # クリーンな整数
                "image_url": item.get('imageurl', ''), # 画像
                "maker": target_maker.lower(),    # メーカー名
                "sku": raw_sku,                   # 元のSKU
                "last_fetched": timezone.now().isoformat()
            }
            results.append(product_map)

        # 5. ファイル保存
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=4)
            
            self.stdout.write(self.style.SUCCESS(
                f"成功！ {len(results)} 件のデータをJSONに変換しました。\n保存先: {output_path}"
            ))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"保存エラー: {e}"))