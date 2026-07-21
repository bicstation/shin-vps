# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/observation_contract.py

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class ProductObservation:
    """
    Observation of a single ProductDB product.

    This represents observed Reality only.
    No semantic interpretation is performed.
    """

    title: str | None

    merchant_name: str | None
    brand_name: str | None

    jan_code: str | None
    model_code: str | None
    product_code: str | None

    guid: str | None

    price: int | float | None

    affiliate_url: str | None


@dataclass(slots=True)
class ObservationDataset:
    """
    ProductDB Observation dataset.
    """

    source: str
    product_count: int
    products: list[ProductObservation]