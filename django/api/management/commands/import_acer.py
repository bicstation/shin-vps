# /mnt/c/dev/SHIN-VPS/django/api/management/commands/import_acer.py

import csv
import os
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct
from api.utils import normalize_pc_data

class Command(BaseCommand):
    help = 'Import Acer PC data and purge legacy pixel image records'

    def handle(self, *args, **options):
        # 💡 コンテナ内のパスを確認
        file_path = '/usr/src/app/acer_detailed_final.csv'
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        # ---------------------------------------------------------
        # 💡 ステップ1: 既存の「ピクセル画像」データを強制排除
        # ---------------------------------------------------------
        deleted_count, _ = PCProduct.objects.filter(
            maker='Acer', 
            image_url__icontains='pixel.jpg'
        ).delete()
        
        if deleted_count > 0:
            self.stdout.write(self.style.SUCCESS(f'Purged {deleted_count} legacy pixel image records.'))

        success_count = 0
        update_count = 0
        
        # ---------------------------------------------------------
        # 💡 ステップ2: 共通モデルのフィールド名に合わせてインポート
        # ---------------------------------------------------------
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # ユーティリティでデータを正規化
                    raw_data = normalize_pc_data(row, site_prefix='acer')

                    # 💡 モデルの定義 (genre, site_prefix) に合わせてデータを再マッピング
                    # もし normalize_pc_data が古いキーを返す場合はここで調整します
                    data = {
                        'unique_id': raw_data['unique_id'],
                        'site_prefix': 'acer',                   # site_name ではなく site_prefix
                        'maker': 'Acer',
                        'genre': raw_data.get('category', 'laptop'), # category ではなく genre
                        'name': raw_data['name'],
                        'price': raw_data['price'],
                        'url': raw_data['url'],
                        'image_url': raw_data['image_url'],
                        'description': raw_data.get('description', ''),
                        'is_active': True,
                    }

                    # ---------------------------------------------------------
                    # 💡 インポート / 更新ロジック (Upsert)
                    # ---------------------------------------------------------
                    # update_or_create を使うことで、filter().first() よりも安全に更新・作成が可能です
                    obj, created = PCProduct.objects.update_or_create(
                        unique_id=data['unique_id'],
                        defaults=data
                    )
                    
                    if created:
                        success_count += 1
                    else:
                        update_count += 1

                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Skip row: {e}"))
        
        self.stdout.write(self.style.SUCCESS(
            f'Acer Import Complete! (Created: {success_count}, Updated: {update_count})'
        ))