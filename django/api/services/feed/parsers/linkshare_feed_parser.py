# =========================================================
# FILE:
# api/services/feed/parsers/linkshare_feed_parser.py
# =========================================================

import ast
import json
import re

from decimal import Decimal


class LinkshareFeedParser:

    # =====================================================
    # PARSE
    # =====================================================

    def parse(
        self,
        source,
    ):

        data = self.parse_raw_data(
            source.raw_csv_data
        )

        return {

            "merchant_id":

                str(
                    source.merchant_id
                ),

            "sku":

                source.sku,

            "name":

                source.product_name,

            "price":

                self.extract_price(
                    source,
                    data,
                ),

            "url":

                self.extract_url(
                    source,
                    data,
                ),

            "image_url":

                self.extract_image(
                    source,
                    data,
                ),

            "category":

                data.get(
                    "category",
                    "",
                ),

            "description_short":

                data.get(
                    "description_short",
                    "",
                ),

            "description_long":

                data.get(
                    "description_long",
                    "",
                ),

            "keywords":

                data.get(
                    "keywords",
                    "",
                ),

            "description":

                self.build_description(
                    source,
                    data,
                ),

            "raw_data":

                data,

        }

    # =====================================================
    # RAW DATA
    # =====================================================

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

    # =====================================================
    # URL
    # =====================================================

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

    # =====================================================
    # IMAGE
    # =====================================================

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

    # =====================================================
    # PRICE
    # =====================================================

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

    # =====================================================
    # DESCRIPTION
    # =====================================================

    def build_description(

        self,

        source,

        data,

    ):

        parts = []

        description_short = (
            data.get(
                "description_short"
            )
            or ""
        )

        description_long = (
            data.get(
                "description_long"
            )
            or ""
        )

        category = (
            data.get(
                "category"
            )
            or ""
        )

        keywords = (
            data.get(
                "keywords"
            )
            or ""
        )

        if description_short:
            parts.append(
                description_short
            )

        if description_long:
            parts.append(
                description_long
            )

        if category:
            parts.append(
                category
            )

        if keywords:
            parts.append(
                keywords
            )

        if not parts:

            parts.append(
                source.product_name
            )

        return "\n".join(
            parts
        )[:5000]

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

            return int(
                float(text)
            )

        except Exception:

            return 0