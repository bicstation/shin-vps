# /mnt/c/dev/SHIN-VPS/django/api/management/commands/import_acer.py

import csv
import os
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct
from api.utils import normalize_pc_data

class Command(BaseCommand):
    help = 'Import Acer PC data and purge legacy pixel image records'

    def handle(self, *args, **options):
        # 💡 スクレイパー側の転送先パスと一致させます
        file_path = '/usr/src/app/scrapers/acer_products_final.csv'
        
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
        with open(file_path, mode='r', encoding='utf-8-sig') as f: # sig付きCSVに対応
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # ユーティリティでデータを正規化
                    raw_data = normalize_pc_data(row, site_prefix='acer')

                    # 💡 モデルの定義に合わせてマッピング
                    data = {
                        'unique_id': raw_data['unique_id'],
                        'site_prefix': 'acer',
                        'maker': 'Acer',
                        'genre': row.get('category', 'laptop').lower(), # CSVのcategory列を使用
                        'name': raw_data['name'],
                        'price': raw_data['price'],
                        'url': raw_data['url'],
                        'image_url': raw_data['image_url'],
                        'description': raw_data.get('description', ''),
                        'is_active': True,
                    }

                    # ---------------------------------------------------------
                    # 💡 Upsertロジック
                    # ---------------------------------------------------------
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