# =========================================================
# FILE:
# api/services/feed/normalizers/pc_feed_normalizer.py
# =========================================================

class PCFeedNormalizer:

    def normalize(

        self,

        parsed,

    ):

        data = parsed["raw_data"]

        return {

            "merchant_id":

                parsed.get(
                    "merchant_id"
                ),

            "sku":

                parsed.get(
                    "sku"
                ),

            "name":

                parsed.get(
                    "name"
                ),

            "price":

                parsed.get(
                    "price",
                    0,
                ),

            "url":

                parsed.get(
                    "url",
                    "",
                ),

            "image_url":

                parsed.get(
                    "image_url",
                    "",
                ),

            "category":

                parsed.get(
                    "category",
                    "",
                ),

            "description":

                parsed.get(
                    "description",
                    "",
                ),

            "keywords":

                parsed.get(
                    "keywords",
                    "",
                ),

            "raw_data":

                data,

        }