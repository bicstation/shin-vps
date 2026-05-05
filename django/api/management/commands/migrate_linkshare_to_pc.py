from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from api.models.linkshare_products import LinkshareProduct
from api.models.pc_products import PCProduct


def clean_price(val):
    """価格を安全にintへ変換"""
    if val is None:
        return 0
    try:
        return int(float(val))
    except:
        return 0


class Command(BaseCommand):
    help = "Migrate LinkshareProduct → PCProduct（唯一の変換・完全版）"

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=0)

    def handle(self, *args, **options):

        self.stdout.write("🚀 START: Linkshare → PCProduct")

        queryset = LinkshareProduct.objects.filter(
            is_active=True
        ).order_by('-updated_at')

        if options['limit'] > 0:
            queryset = queryset[:options['limit']]

        total = 0
        created_count = 0
        skipped_count = 0

        with transaction.atomic():
            for item in queryset:

                # -------------------------
                # 基本データ
                # -------------------------
                sku = item.sku
                mid = item.merchant_id

                if not sku or not mid:
                    skipped_count += 1
                    continue

                unique_id = f"{mid}_{sku}"

                # -------------------------
                # 正規化
                # -------------------------
                name = item.product_name or ""
                price = clean_price(item.price)
                image_url = item.image_url or ""
                maker = item.merchant_name or "unknown"

                # -------------------------
                # 🔥 URLの完全補完ロジック
                # -------------------------
                raw = item.raw_csv_data or {}

                url = (
                    item.product_url
                    or item.affiliate_url
                    or (raw.get("linkurl") if isinstance(raw, dict) else None)
                    or (raw.get("producturl") if isinstance(raw, dict) else None)
                )

                # ❌ URLなしはスキップ（品質維持）
                if not url:
                    skipped_count += 1
                    continue

                try:
                    obj, created = PCProduct.objects.update_or_create(
                        unique_id=unique_id,
                        defaults={
                            "site_prefix": str(mid),
                            "maker": maker,
                            "name": name,
                            "price": price,
                            "url": url,
                            "affiliate_url": url,
                            "image_url": image_url,
                            "description": name[:1000],

                            # 統一
                            "raw_genre": "PC",
                            "unified_genre": "PC",

                            "stock_status": "在庫あり",
                            "is_active": True,
                            "affiliate_updated_at": timezone.now(),
                        }
                    )

                    total += 1
                    if created:
                        created_count += 1

                except Exception as e:
                    self.stderr.write(f"❌ Error {unique_id}: {e}")

        self.stdout.write(
            self.style.SUCCESS(
                f"✅ DONE: {total} processed (new: {created_count}, skipped: {skipped_count})"
            )
        )