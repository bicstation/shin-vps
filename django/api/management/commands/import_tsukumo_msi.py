# api/management/commands/import_tsukumo_msi.py

import csv
import os
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct

class Command(BaseCommand):
    help = 'Import MSI product data from Tsukumo CSV to the unified PCProduct model'

    def handle(self, *args, **options):
        # 💡 Dockerコンテナ内のパス
        file_path = '/usr/src/app/scrapers/tsukumo_msi_products.csv'
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        success_count = 0
        update_count = 0

        # Excel対応の utf-8-sig で読み込み
        with open(file_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # 🔗 URLからユニークIDを生成
                    item_id = row['url'].rstrip('/').split('/')[-1]
                    unique_id = f"tsukumo_{item_id}"

                    # 💡 モデルのフィールド名 (genre, site_prefix) に合わせてデータを整理
                    data = {
                        'unique_id': unique_id,
                        'site_prefix': 'tsukumo',   # モデルの site_prefix に対応
                        'maker': 'MSI',
                        'genre': row['category'],   # CSVの category をモデルの genre に対応
                        'name': row['name'],
                        'price': int(row['price']) if row['price'] else 0,
                        'url': row['url'],
                        'image_url': row['image_url'],
                        'is_active': True,          # 掲載フラグを立てる
                    }

                    # ---------------------------------------------------------
                    # 💡 インポート / 更新ロジック (Upsert)
                    # ---------------------------------------------------------
                    # update_or_create を使うと、コードがより堅牢かつ簡潔になります
                    obj, created = PCProduct.objects.update_or_create(
                        unique_id=unique_id,
                        defaults=data
                    )
                    
                    if created:
                        success_count += 1
                    else:
                        update_count += 1

                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Skip row {row.get('name')}: {e}"))
        
        self.stdout.write(self.style.SUCCESS(
            f'MSI Import Complete! (Created: {success_count}, Updated: {update_count})'
        ))