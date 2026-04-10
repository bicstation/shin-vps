# -*- coding: utf-8 -*-
# /usr/src/app/api/management/commands/auto_map_attributes.py
import re
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import PCProduct, PCAttribute, AdultProduct, AdultAttribute

class Command(BaseCommand):
    help = 'AI解析結果を元に、PCおよびアダルト作品の属性を自動的に紐付けます（ドメイン隔離・高速化版）'

    def handle(self, *args, **options):
        # 1. 処理対象の定義
        # is_adult フラグを使用して、PC製品にはPC属性のみ、アダルトにはアダルト属性のみを適用
        targets = [
            {
                'name': 'Bic Station (PC製品)',
                'products': PCProduct.objects.all().prefetch_related('attributes'),
                # 💡 ここが最大の防護壁: is_adult=False の属性のみをロード
                'attributes': PCAttribute.objects.filter(is_adult=False),
                'fields': ['name', 'description', 'ai_summary', 'cpu_model', 'gpu_model', 'display_info', 'target_segment']
            },
            {
                'name': 'Tiper (アダルト商品)',
                'products': AdultProduct.objects.all().prefetch_related('attributes'),
                # 💡 アダルト側は is_adult=True の属性のみをロード（もし共通テーブルの場合）
                # AdultAttribute が別テーブルなら .all() で問題ありません
                'attributes': AdultAttribute.objects.all(), 
                'fields': [
                    'title', 
                    'product_description', 
                    'rich_description', 
                    'ai_summary', 
                    'ai_content', 
                    'ai_catchcopy', 
                    'target_segment'
                ]
            }
        ]

        total_link_count = 0

        for target in targets:
            product_count = target['products'].count()
            self.stdout.write(self.style.HTTP_INFO(f"🚀 {target['name']} の処理開始: {product_count} 件"))
            
            # 属性をリスト化してメモリに保持（クエリ発行回数を削減）
            attributes_list = list(target['attributes'])
            
            if not attributes_list:
                self.stdout.write(self.style.WARNING(f"⚠️ {target['name']} の対象属性が存在しません。スキップします。"))
                continue

            # データベースへの負荷を考慮し、トランザクションを利用
            with transaction.atomic():
                for product in target['products']:
                    # 安全な値取得
                    search_values = []
                    for field in target['fields']:
                        val = getattr(product, field, "")
                        if val:
                            search_values.append(str(val))
                    
                    # 検索対象テキストの作成（小文字化）
                    target_text = " ".join(search_values).lower()

                    if not target_text.strip():
                        continue

                    # すでに紐付いているIDを取得（重複登録回避）
                    existing_ids = set(product.attributes.values_list('id', flat=True))
                    
                    to_add = []
                    for attr in attributes_list:
                        if attr.id in existing_ids:
                            continue

                        # キーワードリスト作成（正規表現で分割）
                        raw_keywords = attr.search_keywords or ""
                        keywords = [k.strip().lower() for k in re.split(r'[,\s、，\t\n]+', raw_keywords) if k.strip()]
                        
                        # 属性の名前自体も検索ワードに追加
                        keywords.append(attr.name.lower())

                        # 💡 判定ロジック: いずれかのキーワードが含まれているか
                        if any(k in target_text for k in keywords):
                            to_add.append(attr)
                    
                    if to_add:
                        # まとめて中間テーブルへ挿入
                        product.attributes.add(*to_add)
                        total_link_count += len(to_add)

        self.stdout.write(self.style.SUCCESS(f'✅ 全処理完了！ 合計 {total_link_count} 件の紐付けを更新しました。'))