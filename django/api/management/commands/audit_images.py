# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import (
    AdultProduct,
    ImageAudit,
)


class Command(BaseCommand):
    help = "Image Runtime Audit v0"

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=100,
            help="監査件数"
        )

    def handle(self, *args, **options):

        limit = options["limit"]

        queryset = AdultProduct.objects.all()[:limit]

        created_count = 0
        updated_count = 0

        self.stdout.write(
            self.style.NOTICE(
                f"Image Audit Start ({limit})"
            )
        )

        for product in queryset:

            image_url = None

            if product.image_url_list:
                image_url = product.image_url_list[0]

            audit, created = ImageAudit.objects.update_or_create(
                entity_type="adult_product",
                entity_id=product.id,
                defaults={
                    "product_id_unique": getattr(
                        product,
                        "product_id_unique",
                        ""
                    ),
                    "image_url": image_url,
                    "image_status": "unknown",
                    "image_valid": False,
                    "checked_at": timezone.now(),
                }
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Complete "
                f"created={created_count} "
                f"updated={updated_count}"
            )
        )