import csv
import os
import hashlib
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct

class Command(BaseCommand):
    help = 'Import Sycom products from CSV'

    def handle(self, *args, **options):
        csv_file_path = '/usr/src/app/scrapers/sycom_products.csv'
        
        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {csv_file_path}'))
            return

        count = 0
        with open(csv_file_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # URLから固有IDを生成
                unique_id = hashlib.md5(row['url'].encode()).hexdigest()

                PCProduct.objects.update_or_create(
                    unique_id=unique_id,
                    defaults={
                        'site_prefix': 'SY',
                        'maker': 'Sycom',
                        'genre': 'Desktop',
                        'name': row['name'],
                        'price': int(row['price']),
                        'url': row['url'],
                        'image_url': row['image_url'],
                        'description': row['description'],
                        'is_active': True,
                    }
                )
                count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully imported {count} products from Sycom'))