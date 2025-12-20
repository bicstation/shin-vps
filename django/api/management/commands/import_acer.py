import csv
import os
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct
from api.utils import normalize_pc_data

class Command(BaseCommand):
    help = 'Import Acer PC data and purge legacy pixel image records'

    def handle(self, *args, **options):
        file_path = '/usr/src/app/acer_detailed_final.csv'
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        # ---------------------------------------------------------
        # 💡 ステップ1: 既存の「ピクセル画像」データを強制排除
        # ---------------------------------------------------------
        # IDが一致するかどうかに頼らず、URLの中に pixel.jpg が含まれる Acer データを消します
        deleted_count, _ = PCProduct.objects.filter(
            maker='Acer', 
            image_url__icontains='pixel.jpg'
        ).delete()
        
        if deleted_count > 0:
            self.stdout.write(self.style.SUCCESS(f'Purged {deleted_count} legacy pixel image records.'))

        success_count = 0
        update_count = 0
        
        # ---------------------------------------------------------
        # 💡 ステップ2: 綺麗なCSVデータでインポート/更新
        # ---------------------------------------------------------
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    data = normalize_pc_data(row, site_prefix='acer')

                    # 既存の unique_id をチェック
                    obj = PCProduct.objects.filter(unique_id=data['unique_id']).first()
                    
                    if obj:
                        # 既存データがあれば、画像URLを含め最新情報で上書き
                        for key, value in data.items():
                            setattr(obj, key, value)
                        obj.save()
                        update_count += 1
                    else:
                        # なければ新規作成
                        PCProduct.objects.create(**data)
                        success_count += 1

                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Skip row: {e}"))
        
        self.stdout.write(self.style.SUCCESS(
            f'Import Complete! (Created: {success_count}, Updated: {update_count})'
        ))