import csv
import os
import hashlib
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct

class Command(BaseCommand):
    help = 'Import Storm PC data from CSV'

    def handle(self, *args, **options):
        file_path = '/usr/src/app/scrapers/storm_products.csv'
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        success_count = 0
        update_count = 0

        with open(file_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # URLを元に一意のIDを生成 (site_prefix + hash)
                    unique_id = f"storm_{hashlib.md5(row['url'].encode()).hexdigest()[:12]}"
                    
                    data = {
                        'unique_id': unique_id,
                        'site_prefix': 'storm',
                        'maker': 'STORM',
                        'genre': row['category'],
                        'name': row['name'],
                        'price': int(row['price']),
                        'url': row['url'],
                        'image_url': row['image_url'],
                        'is_active': True,
                    }

                    obj, created = PCProduct.objects.update_or_create(
                        unique_id=unique_id,
                        defaults=data
                    )
                    
                    if created:
                        success_count += 1
                    else:
                        update_count += 1

                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Skip row: {e}"))
        
        self.stdout.write(self.style.SUCCESS(
            f'Storm Import Complete! (Created: {success_count}, Updated: {update_count})'
        ))