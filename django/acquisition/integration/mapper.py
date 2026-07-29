# ============================================================================
# FILE:
# acquisition/integration/mapper.py
#
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================
#
# SHIN CORE LINX
# Acquisition Integration Mapper
#
# Responsibility
#
# Import Runtime
#         ↓
# Common Mapping
#         ↓
# PCProduct Payload
#
# NOT
#
# - ORM
# - Save
# - AI Runtime
# ============================================================================
from __future__ import annotations

from typing import Any

from acquisition.common.mapping.pc_product import PCProductMapper


class IntegrationMapper:
    """
    ===========================================================================
    Acquisition Integration Mapper
    ===========================================================================

    Runtime
            ↓
    PCProduct Payload

    Integration Runtime を
    Acquisition 共通の Mapping Contract へ接続する。
    """

    @classmethod
    def to_pc_product(
        cls,
        runtime: Any,
    ) -> dict[str, Any]:
        """
        Runtime
            ↓
        PCProduct Payload
        """

        return PCProductMapper.map(runtime)