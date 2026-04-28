from django.core.management.base import BaseCommand
from api.models.product import Product
from api.services.ranking_service import calculate_ranking_score


class Command(BaseCommand):
    help = "ランキングスコア更新"

    def handle(self, *args, **options):

        products = Product.objects.prefetch_related("attributes").all()

        count = 0

        for p in products:
            score = calculate_ranking_score(p)
            p.ranking_score = score
            p.save()

            count += 1

        self.stdout.write(self.style.SUCCESS(f"✅ 更新完了: {count} 件"))