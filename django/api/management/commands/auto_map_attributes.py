# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/auto_map_attributes.py
import re
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import PCProduct, PCAttribute, AdultProduct, AdultAttribute

class Command(BaseCommand):
    help = 'AI解析結果を元に、PCおよびアダルト作品の属性を自動的に紐付けます（アダルト版最適化済み）'

    def handle(self, *args, **options):
        # 1. 処理対象の定義
        # PC版は現状維持。アダルト版はモデル定義に基づきフィールドを最適化。
        targets = [
            {
                'name': 'PC製品',
                'products': PCProduct.objects.all().prefetch_related('attributes'),
                'attributes': PCAttribute.objects.all(),
                'fields': ['name', 'description', 'ai_summary', 'cpu_model', 'gpu_model', 'display_info', 'target_segment']
            },
            {
                'name': 'アダルト商品',
                'products': AdultProduct.objects.all().prefetch_related('attributes'),
                'attributes': AdultAttribute.objects.all(),
                # 💡 モデル定義に存在する確実なカラム名を指定
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
            self.stdout.write(self.style.HTTP_INFO(f"🚀 {target['name']} の処理開始: {target['products'].count()} 件"))
            
            attributes = target['attributes']
            if not attributes.exists():
                self.stdout.write(self.style.WARNING(f"⚠️ {target['name']} の属性マスターが存在しません。スキップします。"))
                continue

            # データベースへの負荷と速度を考慮し、一括処理の恩恵を受ける
            for product in target['products']:
                # 💡 安全な値取得: getattrにデフォルト値 "" を設定してAttributeErrorを回避
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
                for attr in attributes:
                    if attr.id in existing_ids:
                        continue

                    # 💡 キーワードリスト作成の柔軟化
                    # カンマ(半角・全角)、スペース、改行、タブすべてを区切り文字として扱う
                    raw_keywords = attr.search_keywords or ""
                    keywords = [k.strip().lower() for k in re.split(r'[,\s、，\t\n]+', raw_keywords) if k.strip()]
                    
                    # 属性の名前自体も重要な検索ワードとして追加
                    keywords.append(attr.name.lower())

                    # 💡 判定ロジック
                    if any(k in target_text for k in keywords):
                        to_add.append(attr)
                
                if to_add:
                    # まとめて追加（Djangoの中間テーブルへ一括挿入）
                    product.attributes.add(*to_add)
                    total_link_count += len(to_add)

        self.stdout.write(self.style.SUCCESS(f'✅ 全処理完了！ 合計 {total_link_count} 件の紐付けを更新しました。'))