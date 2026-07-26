#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/integration/results.py

SHIN CORE LINX
Acquisition Integration Results

Responsibilities

- Store Integration Results
- Collect Runtime Statistics
- Print Summary

NOT

- Builder
- Repository
- Runtime
- Business Logic
==============================================================================
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from api.models import PCProduct


@dataclass(slots=True)
class ImportResults:
    """
    Acquisition Integration Results.
    """

    # =========================================================
    # Pipeline Counters
    # =========================================================

    loaded: int = 0
    normalized: int = 0
    built: int = 0
    semantic: int = 0

    created: int = 0
    updated: int = 0

    # =========================================================
    # Runtime Results
    # =========================================================

    payloads: list[dict[str, Any]] = field(default_factory=list)

    products: list["PCProduct"] = field(
        default_factory=list,
    )

    # =========================================================
    # Properties
    # =========================================================

    @property
    def saved(self) -> int:
        """
        Total persisted products.
        """

        return self.created + self.updated

    # =========================================================
    # Summary
    # =========================================================

    def summary(self) -> None:
        """
        Print pipeline summary.
        """

        print()

        print("========================================")
        print(" SHIN IMPORT RESULTS")
        print("========================================")

        print(f" Loaded      : {self.loaded}")
        print(f" Normalized  : {self.normalized}")
        print(f" Built       : {self.built}")
        print(f" Semantic    : {self.semantic}")

        print("----------------------------------------")

        print(f" Created     : {self.created}")
        print(f" Updated     : {self.updated}")
        print(f" Saved Total : {self.saved}")

        print("========================================")