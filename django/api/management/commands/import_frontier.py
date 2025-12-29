import csv
import os
from django.core.management.base import BaseCommand
from api.models import PCProduct
from api.utils.pc_manager import generate_pc_unique_id, get_unified_genre

class Command(BaseCommand):
    help = 'Import Frontier products from CSV with dual-genre classification'

    def handle(self, *args, **options):
        csv_file_path = '/usr/src/app/scrapers/frontier_products.csv'
        site_prefix = 'FR'
        
        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {csv_file_path}'))
            return

        count = 0
        with open(csv_file_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # 1. 共通ユーティリティでIDとジャンルを生成
                unique_id = generate_pc_unique_id(row['url'])
                raw_cat = row.get('category', 'desktop').lower()
                unified_cat = get_unified_genre(site_prefix, raw_cat)

                # 2. データベースへ保存
                PCProduct.objects.update_or_create(
                    unique_id=unique_id,
                    defaults={
                        'site_prefix': site_prefix,
                        'maker': 'Frontier',
                        'raw_genre': raw_cat,
                        'unified_genre': unified_cat,
                        'name': row['name'],
                        'price': int(row['price']),
                        'url': row['url'],
                        'image_url': row['image_url'],
                        'description': row['description'],
                        'is_active': True,
                    }
                )
                count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Successfully imported {count} products from Frontier (Dual-genre system applied)'
        ))