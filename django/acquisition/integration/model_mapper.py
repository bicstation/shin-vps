#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/integration/model_mapper.py

SHIN CORE LINX
Acquisition Integration Model Mapper

Pipeline

BuilderResult
        │
        ├──────────────┐
        │              │
        ▼              ▼
 SemanticResult        │
        │              │
        └──────┬───────┘
               ▼
      PCProductBuilder
               │
               ▼
      PCProduct Payload

Responsibilities

- Merge Builder Result
- Merge Semantic Result
- Build PCProduct Payload

NOT

- Identity Runtime
- Affiliate Runtime
- Commerce Runtime
- Semantic Runtime
- Database
- Persistence
==============================================================================
"""

from __future__ import annotations

from typing import Any

from api.services.feed.builders.pc_product_builder import (
    PCProductBuilder,
)


class ImportModelMapper:
    """
    BuilderResult + SemanticResult
            ↓
    PCProduct Payload
    """

    def __init__(self) -> None:

        self.pc_builder = PCProductBuilder()

    # =========================================================
    # Build
    # =========================================================

    def build(
        self,
        builder_result: dict[str, Any],
        semantic_result: dict[str, Any],
    ) -> dict[str, Any]:

        normalized = {

            #
            # Builder Runtime
            #

            **builder_result,

            #
            # Semantic Runtime
            #

            **semantic_result,

        }

        return self.pc_builder.build(

            normalized=normalized,

            maker=builder_result.get(
                "maker",
                "",
            ),

            prefix=builder_result.get(
                "prefix",
                "",
            ),
        )