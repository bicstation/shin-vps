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

        identity = normalized.get(
            "identity",
            {},
        )

        return {

            # =====================================================
            # Identity
            # =====================================================

            "unique_id": (
                identity.get("unique_id")
            ),

            "site_prefix": prefix,

            "maker": maker,

            "brand": (
                identity.get("brand")
                or normalized.get("brand", "")
            ),

            "series": (
                identity.get("series")
                or normalized.get("series", "")
            ),

            "collaboration": (
                identity.get("collaboration")
                or normalized.get("collaboration", "")
            ),

            "model": normalized.get(
                "model",
                "",
            ),

            "product_no": normalized.get(
                "product_no",
                "",
            ),

            "release_date": normalized.get(
                "release_date",
            ),

            # =====================================================
            # Product
            # =====================================================

            "name": normalized["name"],

            "description": normalized["description"],

            # =====================================================
            # Commerce
            # =====================================================

            "price": normalized["price"],

            "url": normalized["url"],

            "affiliate_url": normalized.get(
                "affiliate_url",
                normalized["url"],
            ),

            # =====================================================
            # Media
            # =====================================================

            "image_url": normalized["image_url"],

            # =====================================================
            # Runtime Defaults
            # =====================================================

            "raw_genre": "PC",

            "unified_genre": "PC",

            "stock_status": "在庫あり",

            "is_active": True,

        }