import os
from django.core.management.base import BaseCommand
from api.models import Article
from django.utils.timezone import now

class Command(BaseCommand):
    help = '指定ディレクトリからMarkdownファイルをDBにインポートします'

    def add_arguments(self, parser):
        parser.add_argument('path', type=str, help='Markdownファイルがあるパス')
        parser.add_argument('--site', type=str, default='tiper', help='サイト識別子')

    def handle(self, *args, **options):
        target_path = options['path']
        site_name = options['site']
        
        if not os.path.exists(target_path):
            self.stdout.write(self.style.ERROR(f'Path not found: {target_path}'))
            return

        files = [f for f in os.listdir(target_path) if f.endswith('.md')]
        count = 0

        for filename in files:
            full_path = os.path.join(target_path, filename)
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # ファイル名からタイトルを仮生成（または1行目をタイトルにする等）
                title = filename.replace('.md', '')
                
                # Articleモデルへ保存
                # source_urlはユニーク制約に関わるため、ファイル名をキーにする
                article, created = Article.objects.get_or_create(
                    site=site_name,
                    source_url=f"file://{site_name}/{filename}",
                    defaults={
                        'title': title,
                        'body_text': content,
                        'content_type': 'post',
                        'main_image_url': 'https://via.placeholder.com/800x600.png?text=Imported+Post',
                    }
                )
                if created:
                    count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully imported {count} posts to {site_name}!'))