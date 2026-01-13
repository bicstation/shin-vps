import csv
from django.core.management.base import BaseCommand
from api.models import PCProduct, PCAttribute

class Command(BaseCommand):
    help = '製品の名称と説明からスペック属性を自動的に紐付けます'

    def handle(self, *args, **options):
        products = PCProduct.objects.all()
        attributes = PCAttribute.objects.all()
        
        self.stdout.write(f"処理開始: {products.count()} 件の製品をチェックします...")
        
        link_count = 0
        for product in products:
            # 検索対象のテキストを合成（製品名 + 詳細説明）
            target_text = f"{product.name} {product.description or ''}"
            
            for attr in attributes:
                # キーワードをカンマで分割してリスト化
                keywords = [k.strip() for k in attr.search_keywords.split(',') if k.strip()]
                # 表示名自体も検索対象に含める
                keywords.append(attr.name)
                
                # キーワードのいずれかがテキストに含まれているかチェック
                if any(k in target_text for k in keywords):
                    # すでに紐付いているか確認し、なければ追加
                    if not product.attributes.filter(id=attr.id).exists():
                        product.attributes.add(attr)
                        link_count += 1
            
        self.stdout.write(self.style.SUCCESS(f'完了！ 新たに {link_count} 件の紐付けを行いました。'))