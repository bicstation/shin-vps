# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/import_contract.py

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class ImportedProduct:
    """
    Canonical Identity Contract for Reality Research.
    """

    # -------------------------
    # Identity
    # -------------------------

    title: str | None

    brand_name: str | None
    model_code: str | None
    jan_code: str | None

    product_code: str | None
    guid: str | None

    # -------------------------
    # Commerce
    # -------------------------

    merchant: str | None
    price: int | float | None

    affiliate_url: str | None

    # -------------------------
    # Original Reality
    # -------------------------

    raw: dict[str, Any]


@dataclass(slots=True)
class ImportedDataset:
    """
    Imported Reality Research Dataset.
    """

    source: str
    product_count: int
    products: list[ImportedProduct]