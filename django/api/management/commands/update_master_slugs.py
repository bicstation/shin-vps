# api/management/commands/update_master_slugs.py
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import Actress, Genre, Maker, Label, Director, Series, Author
import urllib.parse

class Command(BaseCommand):
    help = 'マスターデータのスラッグを自動生成し、正規化します'

    def handle(self, *args, **options):
        models = [Actress, Genre, Maker, Label, Director, Series, Author]
        
        for model in models:
            self.stdout.write(f'Updating {model.__name__}...')
            items = model.objects.all()
            count = 0
            
            for item in items:
                updated = False
                
                # 1. スラッグが空の場合の自動生成
                if not item.slug:
                    # 英数字ならslugify、日本語ならURLエンコードかIDを使用
                    slug_base = slugify(item.name)
                    if not slug_base:
                        # 日本語名の場合は名前をURLエンコードしたものか、シンプルにIDを使用
                        # ここではNext.jsで扱いやすいよう IDベースにしています
                        slug_base = f"{item.id}"
                    
                    item.slug = slug_base
                    updated = True
                
                # 2. 名前のクリーニング (例: "----" などのゴミデータの除外フラグ等)
                if item.name == "----":
                    # 必要に応じて削除や非表示フラグのロジックをここに入れる
                    pass

                if updated:
                    item.save()
                    count += 1
            
            self.stdout.write(self.style.SUCCESS(f'Successfully updated {count} items for {model.__name__}'))