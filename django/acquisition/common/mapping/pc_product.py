# /home/maya/shin-dev/shin-vps/django/acquisition/common/mapping/pc_product.py
# ============================================================================
# FILE:
# acquisition/common/mapping/pc_product.py
#
# SHIN CORE LINX
# PCProduct Mapping Contract
#
# Responsibility
#
# Runtime
#     ↓
# PCProduct Payload
#
# NOT
#
# - Save
# - ORM
# - update_or_create()
# - AI Runtime
# ============================================================================
from __future__ import annotations

from typing import Any, Dict


class PCProductMapper:
    """
    Reality Runtime
            ↓
    PCProduct Payload

    AI解析に必要となる最小限のRealityを
    PCProductへマッピングする。
    """

    @classmethod
    def map(
        cls,
        runtime: Any,
    ) -> Dict[str, Any]:

        return {

            #
            # Identity
            #
            "unique_id": getattr(runtime, "unique_id", ""),
            "product_no": getattr(runtime, "product_no", ""),
            "pc_id": getattr(runtime, "pc_id", ""),
            "maker": getattr(runtime, "maker", ""),

            #
            # Product
            #
            "name": getattr(runtime, "name", ""),
            "description": getattr(runtime, "description", ""),

            #
            # Commerce
            #
            "price": getattr(runtime, "price", 0),
            "affiliate_url": getattr(runtime, "affiliate_url", ""),

            #
            # Media
            #
            "image_url": getattr(runtime, "image_url", ""),

            #
            # Source
            #
            "url": getattr(runtime, "url", ""),
        }