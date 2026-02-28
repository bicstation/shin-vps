# -*- coding: utf-8 -*-
import csv
import os
from django.core.management.base import BaseCommand
# PC用とアダルト用の両方のモデルをインポート
from api.models import PCAttribute, AdultAttribute 

class Command(BaseCommand):
    help = '統合属性マスター(TSV)をインポートします（PC用・アダルト用を自動振り分け）'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str)

    def handle(self, *args, **options):
        file_path = options['file_path']
        
        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f'ファイルが見つかりません: {file_path}'))
            return

        try:
            # 1. 両方のモデルを全クリア（スプレッドシートを正とするため）
            PCAttribute.objects.all().delete()
            AdultAttribute.objects.all().delete()
            self.stdout.write(self.style.WARNING('既存の全属性マスターをクリアしました。'))

            # アダルト用モデルの有効なattr_typeをリスト化（モデルのCHOICESに合わせる）
            adult_types = ['body', 'style', 'scene', 'feature', 'actor_type', 'video_spec']

            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f, delimiter='\t')
                pc_count = 0
                adult_count = 0
                processed_slugs = set()

                for row in reader:
                    # 必須項目チェック
                    attr_type = row.get('attr_type', '').strip()
                    slug = row.get('slug', '').strip()
                    if not slug or not attr_type:
                        continue
                    
                    if slug in processed_slugs:
                        continue

                    # 共通のパラメータ準備
                    params = {
                        'attr_type': attr_type,
                        'slug': slug,
                        'name': row['name'].strip(),
                        'search_keywords': row.get('search_keywords', '').strip(),
                        'order': int(row['order']) if row.get('order') and str(row['order']).isdigit() else 999
                    }

                    # 2. attr_type に基づいて保存先を分岐
                    if attr_type in adult_types:
                        # アダルト属性モデルへ保存
                        AdultAttribute.objects.create(**params)
                        adult_count += 1
                    else:
                        # それ以外はすべてPC属性モデルへ保存
                        PCAttribute.objects.create(**params)
                        pc_count += 1

                    processed_slugs.add(slug)

                self.stdout.write(self.style.SUCCESS(
                    f'✨ 同期完了！\n'
                    f'   - PC属性: {pc_count}件\n'
                    f'   - アダルト属性: {adult_count}件'
                ))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f'エラーが発生しました: {e}'))