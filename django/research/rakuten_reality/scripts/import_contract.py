# =========================================================
# FILE:
# research/rakuten_reality/scripts/import_contract.py
# =========================================================

from types import SimpleNamespace
from typing import Any


# =========================================================
# IMPORT CONTRACT BUILDER
# =========================================================

class ImportContractBuilder:

    # =====================================================
    # BUILD
    # =====================================================

    def build(

        self,

        payload: dict[str, Any],

    ) -> dict[str, Any]:

        return {

            # ---------------------------------------------
            # Feed Source
            # ---------------------------------------------

            "source": SimpleNamespace(

                sku=

                    payload.get(
                        "source_product_id",
                        "",
                    ),

                product_name=

                    payload.get(
                        "name",
                        "",
                    ),

                price=

                    payload.get(
                        "price",
                        0,
                    ),

                image_url=

                    payload.get(
                        "primary_image_url",
                        "",
                    ),

                product_url=

                    payload.get(
                        "product_url",
                        "",
                    ),

                affiliate_url="",

            ),

            # ---------------------------------------------
            # Feed Data
            # ---------------------------------------------

            "data": {

                "description_short":

                    "",

                "description_long":

                    payload.get(
                        "description",
                        "",
                    ),

                "category":

                    payload.get(
                        "category",
                        "",
                    ),

                "keywords":

                    payload.get(
                        "keywords",
                        "",
                    ),

            },

            # ---------------------------------------------
            # Import Options
            # ---------------------------------------------

            "import_options": {

                "maker":

                    payload.get(
                        "maker",
                        "",
                    ),

                "prefix":

                    "rakuten",

                "source":

                    "rakuten",

            },

            # ---------------------------------------------
            # Metadata
            # ---------------------------------------------

            "metadata": {

                "shop_code":

                    payload.get(
                        "shop_code",
                        "",
                    ),

                "shop_name":

                    payload.get(
                        "shop_name",
                        "",
                    ),

            },

        }