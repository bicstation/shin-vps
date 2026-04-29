# api/management/commands/migrate_pc_products.py

from django.core.management.base import BaseCommand
from api.models import Product, PCProduct


class Command(BaseCommand):
    help = 'Migrate PCProduct to Product'

    def handle(self, *args, **kwargs):
        items = PCProduct.objects.all()

        total = 0

        for item in items:
            product_obj, created = Product.objects.update_or_create(
                source='pc',

                # 🔥 正解
                external_id=item.unique_id,

                defaults={
                    'title': item.name or '',
                    'pc_product': item,
                    'thumbnail_url': item.image_url,
                    'affiliate_url': item.url,
                    'price': int(item.price) if item.price else 0,
                    'maker': item.maker or '',
                    'release_date': item.created_at,
                    'ranking_score': item.spec_score or 0,
                    'is_adult': False,
                    'is_active': True,
                    'is_visible': True,
                }
            )

            product_obj.attributes.set(item.attributes.all())

            total += 1

        self.stdout.write(self.style.SUCCESS(
            f'✅ Migration completed: total={total}'
        ))