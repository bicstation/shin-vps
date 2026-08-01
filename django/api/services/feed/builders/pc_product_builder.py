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

            "maker": (
                identity.get("maker")
                or maker
            ),

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
            # Reality Runtime
            # =====================================================

            "observation_runtime": normalized.get(
                "observation_runtime",
                {},
            ),

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
            # Genre Runtime
            # =====================================================

            "raw_genre": normalized.get(
                "raw_genre",
                "",
            ),

            "unified_genre": normalized.get(
                "unified_genre",
                "",
            ),

            # =====================================================
            # Runtime Defaults
            # =====================================================

            "stock_status": "在庫あり",

            "is_active": True,

        }