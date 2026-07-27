#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/integration/semantic.py

SHIN CORE LINX
Acquisition Integration Semantic

Pipeline

BuilderResult
        │
        ▼
SemanticBuilder
        │
        ▼
SemanticRuntimeBuilder
        │
        ▼
SemanticResult

Responsibilities

- Build Semantic Information
- Build Semantic Runtime

NOT

- Model Mapping
- Database
- Persistence
- PCProduct
==============================================================================
"""

from __future__ import annotations

from types import SimpleNamespace
from typing import Any

from api.services.feed.semantic.builders.semantic_builder import (
    SemanticBuilder,
)
from api.services.feed.semantic.builders.semantic_runtime_builder import (
    SemanticRuntimeBuilder,
)


class ImportSemantic:
    """
    Build SemanticResult from BuilderResult.
    """

    def __init__(self) -> None:

        self.semantic_builder = SemanticBuilder()
        self.runtime_builder = SemanticRuntimeBuilder()

    # =========================================================
    # Build
    # =========================================================

    def build(
        self,
        builder_result: dict[str, Any],
    ) -> dict[str, Any]:

        product = SimpleNamespace(
            name=builder_result.get("name", ""),
            description=builder_result.get("description", ""),
            maker=builder_result.get("maker", ""),
        )

        semantic = self.semantic_builder.build(product)

        runtime = self.runtime_builder.build(
            semantic,
        )

        return {

            "semantic": semantic,

            "runtime": runtime,

            "semantic_runtime": {

                "product_type": semantic.get(
                    "product_type"
                ),

                "target_segment": semantic.get(
                    "target_segment"
                ),

                "is_ai_pc": semantic.get(
                    "is_ai_pc"
                ),

                "semantic_labels": runtime.get(
                    "semantic_labels",
                    [],
                ),

                "workflow_tags": runtime.get(
                    "workflow_tags",
                    [],
                ),

                "runtime_profiles": runtime.get(
                    "runtime_profiles",
                    [],
                ),
            },
        }