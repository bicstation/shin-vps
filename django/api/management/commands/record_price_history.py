# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct, PriceHistory
from django.utils.timezone import now

class Command(BaseCommand):
    help = '現在の製品価格をPriceHistoryに記録します（価格変動がある場合のみ）'

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

        count = 0
        skipped = 0

        for product in products:
            # 最新の履歴を取得
            last_history = PriceHistory.objects.filter(product=product).order_by('-recorded_at').first()

            # 履歴がない、または最新履歴と価格が異なる場合のみ保存
            if not last_history or last_history.price != product.price:
                PriceHistory.objects.create(
                    product=product,
                    price=product.price,
                    recorded_at=now()
                )
                count += 1
            else:
                skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f"✅ 完了: {count} 件の価格変更を記録しました（変動なし: {skipped} 件）"
        ))