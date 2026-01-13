import csv
from django.core.management.base import BaseCommand
from api.models import PCAttribute

class Command(BaseCommand):
    help = '属性マスター(TSV)をインポートします'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str)

    def handle(self, *args, **options):
        file_path = options['file_path']
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f, delimiter='\t')
                count = 0
                for row in reader:
                    # 既存のものは更新、なければ作成
                    obj, created = PCAttribute.objects.update_or_create(
                        attr_type=row['attr_type'],
                        slug=row['slug'],
                        defaults={
                            'name': row['name'],
                            'search_keywords': row.get('search_keywords', ''),
                            'order': row.get('order', 0)
                        }
                    )
                    count += 1
                self.stdout.write(self.style.SUCCESS(f'{count} 件の属性マスターを同期しました。'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'エラー: {e}'))