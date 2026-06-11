# =========================================================
# FILE:
# api/services/feed/builders/pc_product_builder.py
# =========================================================

class PCProductBuilder:

    def build(

        self,
        normalized,
        maker,
        prefix,

    ):

        return {

            "unique_id":

                f"{prefix}_{normalized['sku']}",

            "site_prefix":
                prefix,

            "maker":
                maker,

            "name":
                normalized["name"],

            "price":
                normalized["price"],

            "url":
                normalized["url"],

            "affiliate_url":
                normalized["url"],

            "image_url":
                normalized["image_url"],

            "description":
                normalized["description"],

            "raw_genre":
                "PC",

            "unified_genre":
                "PC",

            "stock_status":
                "在庫あり",

            "is_active":
                True,

        }