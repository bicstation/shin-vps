# -*- coding: utf-8 -*-
import os
import csv
from django.core.management.base import BaseCommand
from django.db import connection, transaction

class Command(BaseCommand):
    help = 'TSVファイルからPC属性およびアダルト属性を同期します'

    def handle(self, *args, **options):
        # 💡 インポートパスの衝突を避けるための動的インポート
        try:
            from api.models.pc_products import PCAttribute
            from api.models.adult_models import AdultAttribute
        except ImportError:
            from api.models import PCAttribute, AdultAttribute

        file_path = '/usr/src/app/master_data/attributes.tsv'
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        def process_sync(model_class, target_is_adult):
            label = "🔞 ADULT" if target_is_adult else "💻 PC"
            table_name = model_class._meta.db_table
            
            # データの整合性を保つため、一度クリアして再投入
            with connection.cursor() as cursor:
                cursor.execute(f'TRUNCATE TABLE {table_name} RESTART IDENTITY CASCADE;')
            
            count = 0
            with open(file_path, 'r', encoding='utf-8') as f:
                # DictReaderを使うことで列順の変更に強くする
                reader = csv.DictReader(f, delimiter='\t')
                
                # ヘッダーに is_adult がない場合への対策
                for row in reader:
                    # TSVの is_adult 列を確認 (0 or 1)
                    # カラム名が 'is_adult' であることを想定
                    raw_val = row.get('is_adult', '0').strip()
                    current_row_is_adult = (raw_val == '1')
                    
                    if current_row_is_adult == target_is_adult:
                        model_class.objects.create(
                            slug=row['slug'].strip().lower(),
                            attr_type=row['attr_type'].strip(),
                            name=row['name'].strip(),
                            search_keywords=row.get('search_keywords', '').strip(),
                            order=int(float(row.get('order', 0))),
                            is_adult=target_is_adult
                        )
                        count += 1
            
            self.stdout.write(self.style.SUCCESS(f"✅ {label}: {count} 件同期完了"))

        # トランザクションを張って一気に実行
        with transaction.atomic():
            process_sync(PCAttribute, False) # PC用
            process_sync(AdultAttribute, True) # アダルト用