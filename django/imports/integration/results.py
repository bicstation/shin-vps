# /home/maya/shin-vps/django/imports/integration/results.py

"""
SHIN CORE LINX
Import Integration Results
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from api.models import PCProduct


@dataclass(slots=True)
class ImportResults:
    """
    Import Pipeline Results

    Collects processing statistics and generated objects
    throughout the Import Integration pipeline.
    """

    # -----------------------------------------------------
    # Pipeline Counters
    # -----------------------------------------------------

    loaded: int = 0
    normalized: int = 0
    built: int = 0
    semantic: int = 0
    created: int = 0
    updated: int = 0

    # -----------------------------------------------------
    # Runtime Objects
    # -----------------------------------------------------

    payloads: list[dict[str, Any]] = field(default_factory=list)
    products: list[PCProduct] = field(default_factory=list)

    # -----------------------------------------------------
    # Properties
    # -----------------------------------------------------

    @property
    def saved(self) -> int:
        """Total number of persisted products."""
        return self.created + self.updated

    # -----------------------------------------------------
    # Reporting
    # -----------------------------------------------------

    def summary(self) -> None:

        print()
        print("========================================")
        print(" SHIN IMPORT RESULTS")
        print("========================================")
        print(f" Loaded      : {self.loaded}")
        print(f" Normalized  : {self.normalized}")
        print(f" Built       : {self.built}")
        print(f" Semantic    : {self.semantic}")
        print(f" Created     : {self.created}")
        print(f" Updated     : {self.updated}")
        print("----------------------------------------")
        print(f" Saved Total : {self.saved}")
        print("========================================")