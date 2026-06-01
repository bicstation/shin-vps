# -*- coding: utf-8 -*-
# /api/management/commands/audit_images.py

import requests

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.views.adult_views import AVFLASH_FILTER_V1

from api.models import (
    AdultProduct,
    ImageAudit,
)


class Command(BaseCommand):
    help = "Image Runtime Audit v1"

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=100,
            help="監査件数"
        )

    def handle(self, *args, **options):

        limit = options["limit"]

        queryset = (
            AdultProduct.objects
            .filter(AVFLASH_FILTER_V1)
            [:limit]
        )

        created_count = 0
        updated_count = 0

        self.stdout.write(
            self.style.NOTICE(
                f"Image Audit Start ({limit})"
            )
        )

        for product in queryset:

            # -------------------------------------------------------------
            # 初期値
            # -------------------------------------------------------------

            image_url = None
            final_url = ""
            http_status = None
            content_length = None

            image_status = "unknown"
            image_valid = False

            # -------------------------------------------------------------
            # メイン画像取得
            # -------------------------------------------------------------

            if product.image_url_list:
                image_url = product.image_url_list[0]

            # -------------------------------------------------------------
            # URL未設定
            # -------------------------------------------------------------

            if not image_url:

                image_status = "missing"

            else:

                try:

                    # -----------------------------------------------------
                    # HEAD監査
                    # -----------------------------------------------------

                    response = requests.head(
                        image_url,
                        timeout=10,
                        allow_redirects=True
                    )

                    http_status = response.status_code
                    final_url = response.url

                    content_length = response.headers.get(
                        "Content-Length"
                    )

                    # -----------------------------------------------------
                    # DMM CDN対策
                    # HEAD=405 の場合は GET 再試行
                    # -----------------------------------------------------

                    if http_status == 405:

                        response = requests.get(
                            image_url,
                            stream=True,
                            timeout=10,
                            allow_redirects=True
                        )

                        http_status = response.status_code
                        final_url = response.url

                        content_length = response.headers.get(
                            "Content-Length"
                        )

                    # -----------------------------------------------------
                    # bytes変換
                    # -----------------------------------------------------

                    if content_length:

                        try:
                            content_length = int(
                                content_length
                            )
                        except Exception:
                            content_length = None

                    # -----------------------------------------------------
                    # Placeholder判定
                    # -----------------------------------------------------

                    if "now_printing" in final_url.lower():

                        image_status = "placeholder"
                        image_valid = False

                    # -----------------------------------------------------
                    # 正常
                    # -----------------------------------------------------

                    elif http_status == 200:

                        image_status = "ok"
                        image_valid = True

                    # -----------------------------------------------------
                    # Forbidden
                    # -----------------------------------------------------

                    elif http_status == 403:

                        image_status = "forbidden"

                    # -----------------------------------------------------
                    # Not Found
                    # -----------------------------------------------------

                    elif http_status == 404:

                        image_status = "404"

                    # -----------------------------------------------------
                    # Gone
                    # -----------------------------------------------------

                    elif http_status == 410:

                        image_status = "410"

                    # -----------------------------------------------------
                    # その他
                    # -----------------------------------------------------

                    else:

                        image_status = (
                            f"http_{http_status}"
                        )

                except Exception as e:

                    image_status = "timeout"

            # -------------------------------------------------------------
            # Audit保存
            # -------------------------------------------------------------

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
                    "final_url": final_url,
                    "http_status": http_status,
                    "content_length": content_length,
                    "image_status": image_status,
                    "image_valid": image_valid,
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