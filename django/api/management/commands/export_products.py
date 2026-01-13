import csv
from django.core.management.base import BaseCommand
from api.models import PCProduct  # モデル名に合わせて修正

class Command(BaseCommand):
    help = '分析用に現在のPC製品データをTSV形式で出力します'

    def handle(self, *args, **options):
        # タブ区切り(TSV)で出力することで、製品名内のカンマ問題を回避
        file_path = 'pc_products_analysis.tsv'
        
        # 分析に必要な項目をピックアップ
        fields = [
            'unique_id', 
            'maker', 
            'name', 
            'description', 
            'unified_genre', 
            'price'
        ]

        try:
            with open(file_path, 'w', encoding='utf-8', newline='') as f:
                writer = csv.writer(f, delimiter='\t')
                
                # ヘッダー
                writer.writerow(fields)
                
                # データ（全件）
                products = PCProduct.objects.all()
                for p in products:
                    writer.writerow([
                        p.unique_id,
                        p.maker,
                        p.name,
                        p.description if p.description else "",
                        p.unified_genre,
                        p.price,
                    ])
            
            self.stdout.write(self.style.SUCCESS(f'成功: {file_path} を作成しました。'))
            self.stdout.write('このファイルの内容をコピーして私に共有してください。')
            
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'エラー: {e}'))