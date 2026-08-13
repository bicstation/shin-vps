#!/usr/bin/env python3
# ============================================================================
# FILE:
#     acquisition/common/mapping/pc_product.py
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

    Identity Runtime
            ↓
    brand
    series
    collaboration

    もRuntimeからそのまま保持する。

    このMapperでは、

    - semantic interpretation
    - inference
    - guessing
    - classification

    は行わない。
    """

    @classmethod
    def map(
        cls,
        runtime: Any,
    ) -> Dict[str, Any]:

        return {

            # =========================================================
            # Identity
            # =========================================================

            "unique_id": runtime.get(
                "unique_id",
                "",
            ),

            "product_no": runtime.get(
                "product_no",
                "",
            ),

            "pc_id": runtime.get(
                "pc_id",
                "",
            ),

            "maker": runtime.get(
                "maker",
                "",
            ),

            "brand": runtime.get(
                "brand",
                "",
            ),

            "series": runtime.get(
                "series",
                "",
            ),

            "collaboration": runtime.get(
                "collaboration",
                "",
            ),

            # =========================================================
            # Product
            # =========================================================

            "name": runtime.get(
                "name",
                "",
            ),

            "description": runtime.get(
                "description",
                "",
            ),

            # =========================================================
            # Commerce
            # =========================================================

            "price": runtime.get(
                "price",
                0,
            ),

            "affiliate_url": runtime.get(
                "affiliate_url",
                "",
            ),

            # =========================================================
            # Media
            # =========================================================

            "image_url": runtime.get(
                "image_url",
                "",
            ),

            # =========================================================
            # Source
            # =========================================================

            "url": runtime.get(
                "url",
                "",
            ),
        }