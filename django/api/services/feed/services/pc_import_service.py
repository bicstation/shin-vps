# =========================================================
# FILE:
# api/services/feed/services/pc_import_service.py
# =========================================================

from django.utils import timezone

from api.models.pc_products import PCProduct

from api.services.feed.parsers.linkshare_feed_parser import (
    LinkshareFeedParser,
)

from api.services.feed.builders.pc_product_builder import (
    PCProductBuilder,
)


class PCImportService:

    # =====================================================
    # INIT
    # =====================================================

    def __init__(self):

        self.parser = (
            LinkshareFeedParser()
        )

        self.builder = (
            PCProductBuilder()
        )

    # =====================================================
    # IMPORT
    # =====================================================

    def import_product(

        self,

        source,

        maker,

        prefix,

    ):

        parsed = (

            self.parser.parse(
                source
            )

        )

        payload = (

            self.builder.build(

                parsed=parsed,

                maker=maker,

                prefix=prefix,

            )

        )

        payload[
            "affiliate_updated_at"
        ] = timezone.now()

        obj, created = (

            PCProduct.objects.update_or_create(

                unique_id=payload[
                    "unique_id"
                ],

                defaults=payload,

            )

        )

        return {

            "created":
                created,

            "product":
                obj,

            "payload":
                payload,

        }

    # =====================================================
    # BULK IMPORT
    # =====================================================

    def import_queryset(

        self,

        queryset,

        maker,

        prefix,

    ):

        created_count = 0
        updated_count = 0
        error_count = 0

        for source in queryset.iterator():

            try:

                result = (

                    self.import_product(

                        source=source,

                        maker=maker,

                        prefix=prefix,

                    )

                )

                if result["created"]:

                    created_count += 1

                else:

                    updated_count += 1

            except Exception:

                error_count += 1

        return {

            "created":
                created_count,

            "updated":
                updated_count,

            "errors":
                error_count,

        }