# api/services/feed/builders/pc_product_builder.py

import ast
import json
import re

from decimal import Decimal


class PCProductBuilder:

    # ==========================================
    # BUILD
    # ==========================================

    def build(

        self,

        source,

        maker,
        prefix,

    ):

        data = self.parse_raw_data(

            source.raw_csv_data

        )

        url = self.extract_url(
            source,
            data,
        )

        return {

            "unique_id":

                f"{prefix}_{source.sku}",

            "site_prefix":
                prefix,

            "maker":
                maker,

            "name":

                source.product_name,

            "price":

                self.extract_price(
                    source,
                    data,
                ),

            "url":
                url,

            "affiliate_url":
                url,

            "image_url":

                self.extract_image(
                    source,
                    data,
                ),

            "description":

                self.build_description(
                    source,
                    data,
                ),

            "raw_genre":
                "PC",

            "unified_genre":
                "PC",

            "stock_status":

                (
                    "在庫あり"
                    if source.in_stock
                    else "在庫不明"
                ),

            "is_active":

                source.is_active,

        }

    # ==========================================
    # PARSE
    # ==========================================

    def parse_raw_data(
        self,
        raw_data,
    ):

        if not raw_data:
            return {}

        if isinstance(
            raw_data,
            dict,
        ):
            return raw_data

        try:

            return json.loads(
                raw_data
            )

        except Exception:
            pass

        try:

            return ast.literal_eval(
                raw_data
            )

        except Exception:
            pass

        return {}

    # ==========================================
    # URL
    # ==========================================

    def extract_url(

        self,
        source,
        data,

    ):

        return (

            source.product_url
            or source.affiliate_url
            or data.get(
                "linkurl"
            )
            or ""

        )

    # ==========================================
    # IMAGE
    # ==========================================

    def extract_image(

        self,
        source,
        data,

    ):

        return (

            source.image_url
            or data.get(
                "imageurl"
            )
            or ""

        )

    # ==========================================
    # PRICE
    # ==========================================

    def extract_price(

        self,
        source,
        data,

    ):

        if isinstance(

            source.price,

            (
                int,
                float,
                Decimal,
            ),

        ):

            return int(
                source.price
            )

        price_data = (
            data.get(
                "price"
            )
        )

        if isinstance(
            price_data,
            dict,
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

        return self.clean_price(
            source.price
        )

    # ==========================================
    # DESCRIPTION
    # ==========================================

    def build_description(

        self,
        source,
        data,

    ):

        parts = []

        if data.get(
            "description_short"
        ):

            parts.append(

                data[
                    "description_short"
                ]

            )

        if data.get(
            "description_long"
        ):

            parts.append(

                data[
                    "description_long"
                ]

            )

        if data.get(
            "category"
        ):

            parts.append(

                data[
                    "category"
                ]

            )

        if data.get(
            "keywords"
        ):

            parts.append(

                data[
                    "keywords"
                ]

            )

        if not parts:

            parts.append(
                source.product_name
            )

        return "\n".join(
            parts
        )[:5000]

    # ==========================================
    # CLEAN PRICE
    # ==========================================

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

            return int(
                float(text)
            )

        except Exception:

            return 0