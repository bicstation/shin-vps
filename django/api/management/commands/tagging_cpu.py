from django.core.management.base import BaseCommand
from api.models import PCProduct, PCAttribute
import re

class Command(BaseCommand):
    help = '製品名と詳細スペックからCPU情報を抽出して自動タグ付けします（表記揺れ対応版）'

    def handle(self, *args, **options):
        # 1. CPU属性マスターをすべて取得
        cpu_tags = PCAttribute.objects.filter(attr_type='cpu')
        
        if not cpu_tags.exists():
            self.stdout.write(self.style.WARNING("CPU属性が登録されていません。先に管理画面で作成してください。"))
            return

        products = PCProduct.objects.all()
        total_match_count = 0

        self.stdout.write(f"{products.count()} 件の製品をスキャン中...")

        for product in products:
            # 検索対象のテキストを合体（製品名 + 詳細スペック）
            # 大文字小文字を区別しないため、あらかじめ小文字化しておくと処理がスムーズです
            search_text = f"{product.name} {product.description or ''}".lower()
            
            product_tags_added = []

            for tag in cpu_tags:
                # 検索対象キーワードのリストを作成
                # 1. 表示名(name)
                keywords = [tag.name.lower()]
                
                # 2. 検索キーワード(search_keywords)をカンマで分割して追加
                if tag.search_keywords:
                    # カンマ区切りをリスト化し、空白除去と小文字化を行う
                    extra_keywords = [k.strip().lower() for k in tag.search_keywords.split(',') if k.strip()]
                    keywords.extend(extra_keywords)

                # キーワードのいずれかが含まれているかチェック
                is_match = False
                matched_word = ""
                for kw in keywords:
                    if kw in search_text:
                        is_match = True
                        matched_word = kw
                        break
                
                if is_match:
                    # 中間テーブルに紐付け（すでにある場合は重複しません）
                    product.attributes.add(tag)
                    product_tags_added.append(tag.name)
                    total_match_count += 1
                    self.stdout.write(
                        f"Match: [{product.maker}] {product.name[:30]}... "
                        f"-> {tag.name} (Hit: '{matched_word}')"
                    )

        self.stdout.write(self.style.SUCCESS(f"完了！延べ {total_match_count} 個のタグを紐付けました。"))