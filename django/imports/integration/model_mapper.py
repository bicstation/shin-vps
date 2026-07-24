# =========================================================
# FILE:
# imports/integration/model_mapper.py
# =========================================================

from typing import Any, Dict


class PCProductModelMapper:
    """
    Import Contract -> PCProduct Payload

    Responsibility
    --------------
    RealityをPCProductへマッピングする。

    Semantic生成・Specification解析・AI解析は行わない。
    """

    # =====================================================
    # BUILD
    # =====================================================

    def build(

        self,

        contract: Dict[str, Any],

    ) -> Dict[str, Any]:

        identity = contract.get("identity", {})
        commerce = contract.get("commerce", {})
        media = contract.get("media", {})
        affiliate = contract.get("affiliate", {})
        observation = contract.get("observation", {})

        return {

            # ==========================================
            # Identity
            # ==========================================

            "unique_id":
                identity.get("unique_id"),

            "site_prefix":
                self.extract_site_prefix(
                    identity.get("unique_id")
                ),

            "maker":
                identity.get("maker"),

            "name":
                identity.get("product_name"),

            "model":
                identity.get("model"),

            "product_no":
                identity.get("product_no"),

            "pc_id":
                identity.get("pc_id"),

            # ==========================================
            # Commerce
            # ==========================================

            "price":
                commerce.get("price", 0),

            "release_date":
                commerce.get("release_date"),

            # ==========================================
            # URL
            # ==========================================

            "url":
                identity.get("product_url"),

            "affiliate_url":
                affiliate.get("url"),

            "image_url":
                media.get("image_url"),

            # ==========================================
            # Reality
            # ==========================================

            "description":
                observation.get("feature", ""),

            # ==========================================
            # Initial State
            # ==========================================

            "raw_genre":
                "PC",

            "unified_genre":
                "PC",

            "stock_status":
                "在庫あり",

            "is_active":
                True,

        }

    # =====================================================
    # SITE PREFIX
    # =====================================================

    def extract_site_prefix(

        self,

        unique_id: str | None,

    ) -> str:

        if not unique_id:
            return ""

        return unique_id.split("_", 1)[0]