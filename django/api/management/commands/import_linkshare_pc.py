from decimal import Decimal
import json
import ast
import re

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q

from api.models.linkshare_products import LinkshareProduct
from api.models.pc_products import PCProduct


class Command(BaseCommand):

    help = "Import Linkshare Products -> PCProduct"

    MID_MAP = {
        "35909": {
            "maker": "hp",
            "prefix": "HP",
        },
        "2557": {
            "maker": "dell",
            "prefix": "DELL",
        },
        "2543": {
            "maker": "fujitsu",
            "prefix": "FUJITSU",
        },
        "36508": {
            "maker": "dynabook",
            "prefix": "DYNABOOK",
        },
        "43708": {
            "maker": "asus",
            "prefix": "ASUS",
        },
    }

    # =====================================================
    # ARGUMENTS
    # =====================================================

    def add_arguments(self, parser):

        parser.add_argument(
            "--mid",
            type=str,
        )

        parser.add_argument(
            "--all",
            action="store_true",
        )

    # =====================================================
    # HANDLE
    # =====================================================

    def handle(self, *args, **options):

        if options["all"]:

            for mid in self.MID_MAP.keys():

                self.import_mid(mid)

            return

        mid = options.get("mid")

        if not mid:

            self.stdout.write(
                self.style.ERROR(
                    "--mid or --all required"
                )
            )
            return

        self.import_mid(mid)

    # =====================================================
    # IMPORT MID
    # =====================================================

    def import_mid(self, mid):

        config = self.MID_MAP.get(str(mid))

        if not config:

            self.stdout.write(
                self.style.ERROR(
                    f"Unknown MID: {mid}"
                )
            )
            return

        maker = config["maker"]
        prefix = config["prefix"]

        self.stdout.write(
            f"🚀 MID={mid} maker={maker}"
        )

        queryset = (

            LinkshareProduct.objects.filter(

                Q(merchant_id=str(mid))
                | Q(
                    merchant_id=str(
                        int(mid)
                    )
                ),

                is_active=True,

            )

        )

        total = queryset.count()

        if total == 0:

            self.stdout.write(
                self.style.WARNING(
                    f"⚠️ No Products MID={mid}"
                )
            )

            return

        created_count = 0
        updated_count = 0

        for row in queryset.iterator():

            try:

                data = self.parse_raw_data(
                    row.raw_csv_data
                )

                unique_id = (
                    f"{prefix}_{row.sku}"
                )

                target_url = (
                    row.product_url
                    or row.affiliate_url
                    or data.get("linkurl")
                )

                if not target_url:
                    continue

                description = (
                    data.get(
                        "description_long"
                    )
                    or data.get(
                        "description_short"
                    )
                    or row.product_name
                )

                price = self.extract_price(
                    row.price,
                    data,
                )

                _, created = (

                    PCProduct.objects.update_or_create(

                        unique_id=unique_id,

                        defaults={

                            "site_prefix":
                                prefix,

                            "maker":
                                maker,

                            "name":
                                row.product_name,

                            "price":
                                price,

                            "url":
                                target_url,

                            "affiliate_url":
                                target_url,

                            "image_url":
                                row.image_url or "",

                            "description":
                                description[:3000],

                            "raw_genre":
                                "PC",

                            "unified_genre":
                                "PC",

                            "stock_status":
                                "在庫あり"
                                if row.in_stock
                                else "在庫不明",

                            "is_active":
                                row.is_active,

                            "affiliate_updated_at":
                                timezone.now(),

                        }

                    )

                )

                if created:
                    created_count += 1
                else:
                    updated_count += 1

            except Exception as e:

                self.stdout.write(

                    self.style.ERROR(

                        f"❌ {row.sku} {e}"

                    )

                )

        self.stdout.write(

            self.style.SUCCESS(

                f"✅ MID={mid} "
                f"Total={total} "
                f"Created={created_count} "
                f"Updated={updated_count}"

            )

        )

    # =====================================================
    # PARSE RAW DATA
    # =====================================================

    def parse_raw_data(self, raw_data):

        if not raw_data:
            return {}

        if isinstance(raw_data, dict):
            return raw_data

        try:
            return json.loads(raw_data)

        except Exception:
            pass

        try:
            return ast.literal_eval(raw_data)

        except Exception:
            pass

        return {}

    # =====================================================
    # PRICE
    # =====================================================

    def extract_price(
        self,
        price,
        data,
    ):

        if isinstance(
            price,
            (
                int,
                float,
                Decimal,
            )
        ):
            return int(price)

        price_data = data.get("price")

        if isinstance(
            price_data,
            dict
        ):

            value = (
                price_data.get(
                    "value"
                )
            )

            if value:

                try:
                    return int(
                        float(value)
                    )

                except Exception:
                    pass

        return self.clean_price(price)

    # =====================================================
    # CLEAN PRICE
    # =====================================================

    def clean_price(
        self,
        value,
    ):

        if value is None:
            return 0

        text = re.sub(
            r"[^\d.]",
            "",
            str(value),
        )

        try:
            return int(float(text))

        except Exception:
            return 0