import csv
import os
from django.core.management.base import BaseCommand
from api.models import PCAttribute

class Command(BaseCommand):
    help = '属性マスター(TSV)をインポートします（スプレッドシートを正として全入替）'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str)

    def handle(self, *args, **options):
        file_path = options['file_path']
        
        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f'ファイルが見つかりません: {file_path}'))
            return

        try:
            # --- ここが修正の核心です ---
            # 1. 安全のために、既存の属性データをすべて削除します。
            # これにより、過去のゴミや重複が一切なくなり、スプレッドシートと100%一致させられます。
            PCAttribute.objects.all().delete()
            self.stdout.write(self.style.WARNING('既存の属性マスターをすべてクリアしました。'))

            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f, delimiter='\t')
                count = 0
                processed_slugs = set() # 念のため、シート内の重複行もガード

                for row in reader:
                    # 必須項目がない行は飛ばす
                    if not row.get('slug') or not row.get('attr_type'):
                        continue
                        
                    slug = row['slug'].strip()
                    
                    # 万が一スプレッドシート内に同じスラッグが2行あっても、
                    # 重複エラーを出さずに1行目だけを採用してスキップします。
                    if slug in processed_slugs:
                        self.stdout.write(self.style.NOTICE(f'  ⚠️ スキップ(重複スラッグ): {slug}'))
                        continue

                    # 2. 常に「新規作成」として登録
                    PCAttribute.objects.create(
                        attr_type=row['attr_type'].strip(),
                        slug=slug,
                        name=row['name'].strip(),
                        search_keywords=row.get('search_keywords', '').strip(),
                        # orderが空や文字の場合を考慮して数値化
                        order=int(row['order']) if row.get('order') and str(row['order']).isdigit() else 999
                    )
                    processed_slugs.add(slug)
                    count += 1

                self.stdout.write(self.style.SUCCESS(f'✨ 完了！ {count} 件の属性をスプレッドシートから同期しました。'))

        except Exception as e:
            # 詳しくエラー内容を表示
            self.stderr.write(self.style.ERROR(f'エラーが発生しました: {e}'))