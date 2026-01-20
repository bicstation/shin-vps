# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from api.models import PCProduct, PCAttribute

class Command(BaseCommand):
    help = 'AI解析結果（構造化データ＋要約）を対象に、スペック属性を自動的に紐付けます'

    def handle(self, *args, **options):
        # 1. 全製品と全属性をロード
        products = PCProduct.objects.all()
        attributes = PCAttribute.objects.all()
        
        self.stdout.write(f"🚀 処理開始: {products.count()} 件の製品をチェックします...")
        
        link_count = 0
        for product in products:
            # --- 【重要】検索対象テキストの拡大 ---
            # AIが苦労して抽出・生成した各フィールドを連結して、強力な「検索の網」を作ります
            search_targets = [
                product.name,
                product.description or '',
                product.ai_summary or '',    # Gemma3が生成した要約
                product.cpu_model or '',     # AIが特定したCPU型番
                product.gpu_model or '',     # AIが特定したGPU型番
                product.display_info or '',  # 液晶スペック
                product.target_segment or '' # 「ゲーミング」「クリエイター」等
            ]
            
            # 比較のためにすべて小文字化して一つの文字列に統合
            target_text = " ".join(filter(None, search_targets)).lower()
            
            # この製品に現在紐付いている属性IDを取得（二重登録を避ける）
            existing_ids = set(product.attributes.values_list('id', flat=True))
            
            for attr in attributes:
                # すでに紐付いていればスキップ
                if attr.id in existing_ids:
                    continue

                # 検索キーワードをリスト化（小文字化）
                keywords = [k.strip().lower() for k in attr.search_keywords.split(',') if k.strip()]
                # 属性の表示名そのものもキーワードに加える
                keywords.append(attr.name.lower())
                
                # キーワードのいずれかが target_text に含まれているかチェック
                if any(k in target_text for k in keywords):
                    product.attributes.add(attr)
                    link_count += 1
            
        self.stdout.write(self.style.SUCCESS(f'✅ 完了！ 新たに {link_count} 件の紐付けを行いました。'))