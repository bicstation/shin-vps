from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from api.models.linkshare_products import LinkshareProduct

# ⚠️ API取得ロジックは変更しない
from api.management.commands.linkshare_bc_client import LinkShareAPIClient


class Command(BaseCommand):
    help = "Import Linkshare API data into LinkshareProduct"

    def add_arguments(self, parser):
        parser.add_argument('--mid', type=str, nargs='+', help='MID指定')
        parser.add_argument('--limit', type=int, default=0)

    def handle(self, *args, **options):

        self.stdout.write("🚀 Linkshare API Import START")

        client = LinkShareAPIClient()
        client.get_access_token()

        if not options['mid']:
            self.stdout.write("❌ MID指定が必要です")
            return

        total = 0

        for mid in options['mid']:
            mid = str(mid)
            self.stdout.write(f"🔄 MID: {mid}")

            results = client.search_products(
                keyword=None,
                mid=mid,
                cat=None,
                page_size=100,
                max_pages=0,
                none=None
            )

            if not results:
                continue

            items = []
            for page in results:
                items.extend(page.get("items", []))

            if options['limit'] > 0:
                items = items[:options['limit']]

            with transaction.atomic():
                for item in items:

                    sku = item.get("sku")
                    if not sku:
                        continue

                    # -------------------------
                    # 🔥 安全な価格変換（ここが修正ポイント）
                    # -------------------------
                    raw_price = item.get("price")

                    if isinstance(raw_price, dict):
                        price = raw_price.get("value")
                    else:
                        price = raw_price

                    try:
                        price = float(price) if price else 0
                    except:
                        price = 0

                    # -------------------------
                    # 基本情報
                    # -------------------------
                    product_name = item.get("productname")
                    link_url = item.get("linkurl") or item.get("producturl")
                    image_url = item.get("imageurl")

                    try:
                        LinkshareProduct.objects.update_or_create(
                            merchant_id=mid,
                            sku=sku,
                            defaults={
                                "product_name": product_name,
                                "price": price,
                                "product_url": link_url,
                                "affiliate_url": link_url,
                                "image_url": image_url,
                                "api_source": "api",

                                # 🔥 生データそのまま保存
                                "raw_csv_data": item,

                                "is_active": True,
                                "updated_at": timezone.now(),
                            }
                        )

                        total += 1

                    except Exception as e:
                        self.stderr.write(
                            f"❌ Error SKU {sku}: {e}"
                        )

        self.stdout.write(self.style.SUCCESS(f"✅ DONE: {total} records"))