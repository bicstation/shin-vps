# /home/maya/shin-dev/shin-vps/django/research/rakuten_reality/scripts/observation_contract.py

"""
Rakuten Reality Research

Observation Contract

Responsibility
--------------
Define the Observation data model.

This module MUST NOT:

- Call APIs
- Validate Data
- Map Payloads
- Save Files
"""

from __future__ import annotations

from dataclasses import asdict
from dataclasses import dataclass
from dataclasses import field
from typing import Any


@dataclass(slots=True)
class Observation:
    """
    Observation of a single Rakuten product.
    """

    # ==========================================================
    # Metadata
    # ==========================================================

    version: str = ""

    source: str = ""

    observed_at: str = ""

    # ==========================================================
    # Product
    # ==========================================================

    source_product_id: str = ""

    shop_code: str = ""

    shop_name: str = ""

    maker: str = ""

    name: str = ""

    # ==========================================================
    # Commerce
    # ==========================================================

    price: int | None = None

    review_average: float | None = None

    review_count: int | None = None

    product_url: str = ""

    # ==========================================================
    # Images
    # ==========================================================

    primary_image_url: str = ""

    image_urls: list[str] = field(default_factory=list)

    # ==========================================================
    # Description
    # ==========================================================

    description: str = ""

    # ==========================================================
    # Specification
    # ==========================================================

    cpu: str = ""

    gpu: str = ""

    memory: str = ""

    storage: str = ""

    display: str = ""

    resolution: str = ""

    refresh_rate: str = ""

    weight: str = ""

    battery: str = ""

    npu: str = ""

    operating_system: str = ""

    wireless: str = ""

    # ==========================================================
    # Raw Evidence
    # ==========================================================

    raw: dict[str, Any] = field(default_factory=dict)

    # ==========================================================
    # Utilities
    # ==========================================================

    def to_dict(self) -> dict[str, Any]:
        """
        Convert Observation to dictionary.
        """

        return asdict(self)

    @classmethod
    def from_dict(
        cls,
        data: dict[str, Any],
    ) -> "Observation":
        """
        Create Observation from dictionary.
        """

        return cls(**data)