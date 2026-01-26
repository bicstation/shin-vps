# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct

class Command(BaseCommand):
    help = '現在の製品価格をPriceHistoryに記録します（毎日1回は必ず記録）'

    def add_arguments(self, parser):
        parser.add_argument('--maker', type=str, help='特定のメーカーのみ実行')
        parser.add_argument('--all', action='store_true', help='全製品を対象に実行')

    def handle(self, *args, **options):
        products = PCProduct.objects.filter(is_active=True)
        
        if options['maker']:
            products = products.filter(maker=options['maker'])
            self.stdout.write(f"🔎 メーカー指定: {options['maker']}")
        elif not options['all']:
            self.stdout.write(self.style.ERROR("❌ --maker [name] または --all を指定してください"))
            return

        total_count = products.count()
        self.stdout.write(f"🚀 {total_count} 件の製品に対して価格記録を開始します...")

        for product in products:
            # 🚀 models.py に追加した新メソッドを呼び出す
            # これにより「今日すでに記録があれば更新、なければ新規作成」が自動で行われます
            product.record_daily_price()

        self.stdout.write(self.style.SUCCESS(
            f"✅ 完了: {total_count} 件の製品の「今日の価格」を記録しました。"
        ))