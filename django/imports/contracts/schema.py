"""
SHIN CORE LINX
Import Contract Schema

Reality
    ↓
Import Contract
    ↓
PCProduct Payload
"""

from __future__ import annotations

from typing import Any
from typing import TypedDict


# ==========================================================
# Identity
# ==========================================================

class IdentityContract(TypedDict):

    unique_id: str

    maker: str

    brand: str
    series: str
    collaboration: str

    product_name: str

    product_url: str
    affiliate_url: str


# ==========================================================
# Commerce
# ==========================================================

class CommerceContract(TypedDict):

    price: int | float | str

    currency: str


# ==========================================================
# Media
# ==========================================================

class MediaContract(TypedDict):

    image_url: str

    images: list[str]


# ==========================================================
# Observation
# ==========================================================

class ObservationContract(TypedDict, total=False):

    title: str
    url: str

    description: str

    main_image: str

    images: list[str]

    tables: list[Any]

    scripts: list[str]


# ==========================================================
# Import Contract
# ==========================================================

class ImportContract(TypedDict):

    identity: IdentityContract

    commerce: CommerceContract

    media: MediaContract

    observation: ObservationContract