import csv
import re
from django.core.management.base import BaseCommand
# プロジェクト構造に合わせて修正済み
from api.models.pc_products import PCProduct

class Command(BaseCommand):
    help = 'Import Sycom products from CSV'

    def handle(self, *args, **options):
        # コンテナ内のCSVパス
        file_path = '/usr/src/app/scrapers/sycom_products.csv'
        
        try:
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                count = 0
                for row in reader:
                    # 💡 URLから商品番号（no=001000など）を抽出して unique_id に割り当てる
                    # これにより api_pcproduct_unique_id_key の重複エラーを回避します
                    url = row['url']
                    match = re.search(r'no=(\d+)', url)
                    if match:
                        u_id = f"sycom_{match.group(1)}"
                    else:
                        # 万が一番号が取れない場合は名前から生成
                        u_id = f"sycom_{row['name']}"

                    # 💡 unique_id を識別キー（第一引数）として作成・更新
                    PCProduct.objects.update_or_create(
                        unique_id=u_id,
                        defaults={
                            'name': row['name'],
                            'genre': row['category'], # row['category'] を genre フィールドへ
                            'price': int(row['price']),
                            'url': url,
                        }
                    )
                    count += 1
            self.stdout.write(self.style.SUCCESS(f'Successfully imported {count} products from Sycom'))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
        except Exception as e:
            # 詳細なエラー内容を表示
            self.stdout.write(self.style.ERROR(f'An error occurred: {e}'))