# /home/maya/shin-vps/django/imports/integration/semantic.py

"""
SHIN CORE LINX
Import Integration Semantic

Pipeline

Payload
    │
    ▼
SemanticBuilder
    │
    ▼
Semantic Payload
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
    Import Semantic

    Responsibility
    --------------
    Payload
        ↓
    SemanticBuilder
        ↓
    SemanticRuntimeBuilder
        ↓
    Semantic Payload
    """

    def __init__(self) -> None:

        self.semantic_builder = SemanticBuilder()
        self.runtime_builder = SemanticRuntimeBuilder()

    # =========================================================
    # Build
    # =========================================================

    def build(
        self,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Build semantic information.
        """

        product = SimpleNamespace(
            name=payload.get("name", ""),
            description=payload.get("description", ""),
            maker=payload.get("maker", ""),
        )

        semantic_payload = self.semantic_builder.build(product)

        runtime_payload = self.runtime_builder.build(
            semantic_payload
        )

        payload.update(semantic_payload)
        payload.update(runtime_payload)

        payload["semantic_runtime"] = {
            "product_type": semantic_payload.get("product_type"),
            "target_segment": semantic_payload.get("target_segment"),
            "is_ai_pc": semantic_payload.get("is_ai_pc"),
            "semantic_labels": runtime_payload.get("semantic_labels", []),
            "workflow_tags": runtime_payload.get("workflow_tags", []),
            "runtime_profiles": runtime_payload.get("runtime_profiles", []),
        }

        return payload