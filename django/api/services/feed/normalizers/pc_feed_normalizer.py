# =========================================================
# FILE:
# api/services/feed/normalizers/pc_feed_normalizer.py
# =========================================================

class PCFeedNormalizer:

    # =====================================================
    # NORMALIZE
    # =====================================================

    def normalize(

        self,

        source,
        data,

    ):

        sku = (

            source.sku
            .replace(":", "-")

        )

        return {

            "sku":

                sku,

            "name":

                source.product_name,

            "description":

                self.build_description(
                    source,
                    data,
                ),

            "price":

                self.extract_price(
                    source,
                    data,
                ),

            "image_url":

                source.image_url
                or data.get(
                    "imageurl"
                )
                or "",

            "url":

                source.product_url
                or source.affiliate_url
                or data.get(
                    "linkurl"
                )
                or "",

            "category":

                data.get(
                    "category"
                )
                or "",

            "keywords":

                data.get(
                    "keywords"
                )
                or "",

        }

    # =====================================================
    # DESCRIPTION
    # =====================================================

    def build_description(

        self,

        source,
        data,

    ):

        parts = []

        parts.append(
            source.product_name
        )

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
                .replace(
                    "~~",
                    "\n"
                )
            )

        return "\n\n".join(
            [
                p
                for p in parts
                if p
            ]
        )[:5000]

    # =====================================================
    # PRICE
    # =====================================================

    def extract_price(

        self,

        source,
        data,

    ):

        if source.price:
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
                        float(
                            value
                        )
                    )

                except Exception:
                    pass

        return 0