from django.core.management.base import BaseCommand
from api.models import PCProduct, PCAttribute
import re

class Command(BaseCommand):
    help = '全属性（CPU、メモリ、NPU等）をマスターに基づいて自動タグ付けします'

    def handle(self, *args, **options):
        # 1. 全属性マスターを取得
        all_attributes = PCAttribute.objects.all()
        
        if not all_attributes.exists():
            self.stdout.write(self.style.WARNING("属性マスターが空です。"))
            return

        products = PCProduct.objects.all()
        total_match_count = 0

        self.stdout.write(f"{products.count()} 件の製品をスキャンし、{all_attributes.count()} 種の属性を判定します...")

        for product in products:
            search_text = f"{product.name} {product.description or ''}".lower()
            
            # 各製品に対して、全属性をチェック
            for attr in all_attributes:
                # 検索用キーワードリスト（表示名 + search_keywords）
                keywords = [attr.name.lower()]
                if attr.search_keywords:
                    extra_keywords = [k.strip().lower() for k in attr.search_keywords.split(',') if k.strip()]
                    keywords.extend(extra_keywords)

                is_match = False
                matched_word = ""
                for kw in keywords:
                    if kw in search_text:
                        is_match = True
                        matched_word = kw
                        break
                
                if is_match:
                    # 属性を紐付け
                    product.attributes.add(attr)
                    total_match_count += 1
                    # ログにはどのタイプのどの属性が付いたか表示
                    self.stdout.write(
                        f"[{product.maker}] -> {attr.get_attr_type_display()}: {attr.name} (Hit: '{matched_word}')"
                    )

        self.stdout.write(self.style.SUCCESS(f"完了！合計 {total_match_count} 個の属性を紐付けました。"))