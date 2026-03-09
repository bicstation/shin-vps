import os
from django.core.management.base import BaseCommand
from api.models.pc_products import PCAttribute

class Command(BaseCommand):
    help = 'TSVファイルから属性マスタを同期します'

    def handle(self, *args, **options):
        file_path = '/usr/src/app/master_data/attributes.tsv'
        
        if not os.path.exists(file_path):
            self.stderr.write(f"❌ ファイルが見つかりません: {file_path}")
            return

        # 1. 既存データを一旦クリア（ただし、エラーが出ても続行させるために atomic にしない）
        PCAttribute.objects.all().delete()
        self.stdout.write("🧹 既存の全属性マスターをクリアしました。")

        count = 0
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for line in lines:
                # 前後の空白を除去
                line = line.strip()
                if not line or line.startswith('attr_type'):
                    continue # ヘッダーや空行をスキップ
                
                # タブ区切りで分割
                parts = line.split('\t')
                if len(parts) < 3:
                    continue
                
                attr_type = parts[0].strip()
                name = parts[1].strip()
                slug = parts[2].strip().lower() # Slugを正規化

                try:
                    order_val = int(float(parts[-1]))
                except (ValueError, IndexError):
                    order_val = 0
                
                # 【重要】create ではなく update_or_create を使う
                # これにより、同じ Slug がファイル内にあってもエラーにならず上書き（無視）される
                obj, created = PCAttribute.objects.update_or_create(
                    slug=slug,
                    defaults={
                        'attr_type': attr_type,
                        'name': name,
                        'order': order_val,
                    }
                )
                if created:
                    count += 1

        self.stdout.write(self.style.SUCCESS(f"✅ {count} 件の属性を新規登録（同期）しました。"))