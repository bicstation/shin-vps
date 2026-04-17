# -*- coding: utf-8 -*-
import os
import csv
from django.core.management.base import BaseCommand
from django.db import transaction

class Command(BaseCommand):
    help = 'TSVファイルからPC属性およびアダルト属性を安全に同期します（紐付けを維持）'

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
            
            # 🚨 【修正ポイント】TRUNCATEを廃止
            # 以前のコードにあった TRUNCATE TABLE ... CASCADE は、
            # 製品と属性の紐付け（中間テーブル）を全て消し去る「破壊神」だったため削除しました。
            
            count = 0
            updated_ids = []

            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f, delimiter='\t')
                
                for row in reader:
                    raw_val = row.get('is_adult', '0').strip()
                    current_row_is_adult = (raw_val == '1')
                    
                    if current_row_is_adult == target_is_adult:
                        # 💡 【修正ポイント】update_or_create を採用
                        # slugをキーにして、既存データがあれば更新、なければ作成します。
                        # これにより、Productとの中間テーブルにあるIDとの整合性が保たれます。
                        obj, created = model_class.objects.update_or_create(
                            slug=row['slug'].strip().lower(),
                            defaults={
                                'attr_type': row['attr_type'].strip(),
                                'name': row['name'].strip(),
                                'search_keywords': row.get('search_keywords', '').strip(),
                                'order': int(float(row.get('order', 0))),
                                'is_adult': target_is_adult
                            }
                        )
                        updated_ids.append(obj.id)
                        count += 1
            
            # (任意) TSVから削除された古い属性をDBからも消したい場合は、以下のコメントアウトを解除
            # model_class.objects.filter(is_adult=target_is_adult).exclude(id__in=updated_ids).delete()

            self.stdout.write(self.style.SUCCESS(f"✅ {label}: {count} 件同期完了 (リレーション維持)"))

        # トランザクションを張ってデータの整合性を保証
        try:
            with transaction.atomic():
                process_sync(PCAttribute, False)    # PC用
                process_sync(AdultAttribute, True)   # アダルト用
            self.stdout.write(self.style.SUCCESS("✨ すべての属性同期が正常に完了しました。"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 同期中にエラーが発生しました: {str(e)}"))