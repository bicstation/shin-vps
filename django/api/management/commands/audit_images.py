# -*- coding: utf-8 -*-
# /api/management/commands/audit_images.py

# ==========================================================
# Image Runtime Audit Command
#
# SHIN CORE LINX Runtime Layer
#
# 役割:
#   AdultProduct の画像状態を監査し、
#   ImageAudit テーブルへ保存する。
#
# Frontend:
#   image_valid のみ参照
#
# Backend:
#   image_status を真実として管理
#
# 判定対象:
#   - URL欠損
#   - HTTP Status
#   - Redirect先
#   - Placeholder
#   - Content-Length
#
# 保存先:
#   ImageAudit
#
# Runtime Version:
#   v1.5
# ==========================================================


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

        # ------------------------------------------------------
        # 監査件数
        # ------------------------------------------------------
        parser.add_argument(
            "--limit",
            type=int,
            default=100,
            help="監査件数"
        )

        # ------------------------------------------------------
        # 開始位置
        # ------------------------------------------------------
        parser.add_argument(
            "--offset",
            type=int,
            default=0,
            help="開始オフセット"
        )

        # ------------------------------------------------------
        # 全件監査
        # ------------------------------------------------------
        parser.add_argument(
            "--all",
            action="store_true",
            help="全件監査"
        )

        # ------------------------------------------------------
        # 未監査のみ
        # ------------------------------------------------------
        parser.add_argument(
            "--new-only",
            action="store_true",
            help="未監査のみ"
        )

        # ------------------------------------------------------
        # 強制再監査
        # ------------------------------------------------------
        parser.add_argument(
            "--force",
            action="store_true",
            help="既存監査を無視"
        )

        # ------------------------------------------------------
        # プロバイダ絞り込み
        # ------------------------------------------------------
        parser.add_argument(
            "--provider",
            type=str,
            default=None,
            help="FANZA / DUGA"
        )

        # ------------------------------------------------------
        # ステータス再監査
        # ------------------------------------------------------
        parser.add_argument(
            "--status",
            type=str,
            default=None,
            help="placeholder / forbidden"
        )

        # ------------------------------------------------------
        # 通信タイムアウト
        # ------------------------------------------------------
        parser.add_argument(
            "--timeout",
            type=int,
            default=10,
            help="HTTP timeout"
        )

    def handle(self, *args, **options):

        limit = options["limit"]
        offset = options["offset"]
        timeout = options["timeout"]

        new_only = options["new_only"]
        force = options["force"]

        provider = options["provider"]
        status_filter = options["status"]
        audit_all = options["all"]
        
        
        queryset = (
            AdultProduct.objects
            .filter(AVFLASH_FILTER_V1)
        )

        # ---------------------------------------------------------
        # Provider Filter
        # ---------------------------------------------------------

        if provider:

            queryset = queryset.filter(
                api_source__iexact=provider
            )

        # ---------------------------------------------------------
        # 未監査のみ
        # ---------------------------------------------------------

        if new_only:

            audited_ids = (
                ImageAudit.objects
                .filter(
                    entity_type="adult_product"
                )
                .values_list(
                    "entity_id",
                    flat=True
                )
            )

            queryset = queryset.exclude(
                id__in=audited_ids
            )

        # ---------------------------------------------------------
        # ステータス再監査
        # ---------------------------------------------------------

        if status_filter:

            target_ids = (
                ImageAudit.objects
                .filter(
                    image_status=status_filter
                )
                .values_list(
                    "entity_id",
                    flat=True
                )
            )

            queryset = queryset.filter(
                id__in=target_ids
            )

        # ---------------------------------------------------------
        # Offset + Limit
        # ---------------------------------------------------------

        if not audit_all:

            queryset = queryset[
                offset:offset + limit
            ]


        created_count = 0
        updated_count = 0

        self.stdout.write(
            self.style.NOTICE(
                f"""
        Image Runtime Audit

        limit={limit}
        offset={offset}
        provider={provider}
        new_only={new_only}
        force={force}
        """
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
            
            failure_reason = ""           

            if not image_url:

                image_status = "missing"

            else:

                try:

                    # -----------------------------------------------------
                    # HEAD監査
                    # -----------------------------------------------------

                    response = requests.head(
                        image_url,
                        timeout=timeout,
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


                    placeholder_patterns = [

                        "now_printing",
                        "noimage",
                        "no_image",
                        "placeholder",

                    ]

                    if any(
                        pattern in final_url.lower()
                        for pattern in placeholder_patterns
                    ):

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
                    failure_reason = str(e)[:500]

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
                    "failure_reason": failure_reason,
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
