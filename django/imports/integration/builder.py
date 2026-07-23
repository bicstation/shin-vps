# /home/maya/shin-vps/django/imports/integration/builder.py
# /home/maya/shin-vps/django/imports/integration/builder.py

"""
SHIN CORE LINX
Import Integration Builder

Pipeline

Normalized Feed
        │
        ▼
PCProductBuilder
        │
        ▼
Payload
"""

from __future__ import annotations

from typing import Any

from api.services.feed.builders.pc_product_builder import (
    PCProductBuilder,
)


class ImportBuilder:
    """
    Import Builder

    Responsibility
    --------------
    Normalized Feed
            ↓
    PCProductBuilder
            ↓
    Payload
    """

    def __init__(self) -> None:
        self.builder = PCProductBuilder()

    # =========================================================
    # Build
    # =========================================================

    def build(
        self,
        normalized: dict[str, Any],
        *,
        maker: str,
        prefix: str,
    ) -> dict[str, Any]:
        """
        Build PCProduct payload.
        """

        return self.builder.build(
            normalized=normalized,
            maker=maker,
            prefix=prefix,
        )