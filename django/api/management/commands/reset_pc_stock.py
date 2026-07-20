from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct


class Command(BaseCommand):
    help = "Reset all PCProduct stock to inactive"

    def handle(self, *args, **kwargs):
        updated = PCProduct.objects.update(
            is_active=True,
            stock_status="在庫なし"
        )

        self.stdout.write(
            self.style.SUCCESS(f"✅ Reset stock: {updated} items")
        )