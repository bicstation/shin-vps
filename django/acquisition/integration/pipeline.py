# ============================================================================
# FILE:
# acquisition/integration/pipeline.py
#
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================
#
# SHIN CORE LINX
# Acquisition Integration Pipeline
#
# Responsibility
#
# Normalized Runtime
#         ↓
# PCProduct Builder
#         ↓
# Integration Mapper
#         ↓
# PCProduct Payload
#
# NOT
#
# - ORM
# - Save
# - update_or_create()
# - AI Runtime
# ============================================================================
from __future__ import annotations

from typing import Any

from .builder import PCProductBuilder
from .mapper import IntegrationMapper


class IntegrationPipeline:
    """
    ===========================================================================
    Acquisition Integration Pipeline
    ===========================================================================

    Normalized Runtime
            ↓
    PCProduct Builder
            ↓
    Integration Mapper
            ↓
    PCProduct Payload

    Acquisition Runtime から
    PCProduct Payload を生成する。
    """

    def __init__(self) -> None:

        self.builder = PCProductBuilder()

    # =========================================================
    # Build Payload
    # =========================================================

    def build_payload(
        self,
        normalized: dict[str, Any],
        maker: str,
        prefix: str,
    ) -> dict[str, Any]:
        """
        Normalized Runtime
                ↓
        PCProduct Builder
                ↓
        Integration Mapper
                ↓
        PCProduct Payload
        """

        runtime = self.builder.build(
            normalized=normalized,
            maker=maker,
            prefix=prefix,
        )
        
        
        

        return IntegrationMapper.to_pc_product(
            runtime
        )