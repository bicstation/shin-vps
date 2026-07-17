# /home/maya/shin-dev/shin-vps/django/research/rakuten_reality/scripts/observe.py
# /home/maya/shin-dev/shin-vps/django/research/rakuten_reality/scripts/observe.py

"""
Rakuten Reality Research

Observe

Responsibility
--------------
Convert Rakuten API response into Observation objects.

This module MUST NOT:

- Call APIs
- Validate Data
- Map Payloads
- Save Files
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from config import (
    OBSERVATION_SOURCE,
    OBSERVATION_VERSION,
)

from observation_contract import Observation


def create_observation(
    item: dict[str, Any],
) -> Observation:
    """
    Create an Observation from a Rakuten Item.
    """

    image_urls: list[str] = []

    for image in item.get("mediumImageUrls", []):

        url = image.get("imageUrl")

        if url:
            image_urls.append(url)

    primary_image_url = ""

    if image_urls:
        primary_image_url = image_urls[0]

    return Observation(
        version=OBSERVATION_VERSION,
        source=OBSERVATION_SOURCE,
        observed_at=datetime.utcnow().isoformat(),

        source_product_id=item.get("itemCode", ""),
        shop_code=item.get("shopCode", ""),
        shop_name=item.get("shopName", ""),
        maker=item.get("makerName", ""),
        name=item.get("itemName", ""),

        price=item.get("itemPrice"),
        review_average=item.get("reviewAverage"),
        review_count=item.get("reviewCount"),
        product_url=item.get("itemUrl", ""),

        primary_image_url=primary_image_url,
        image_urls=image_urls,

        description=item.get("itemCaption", ""),

        raw=item,
    )


def create_observations(
    raw_json: dict[str, Any],
) -> list[Observation]:
    """
    Convert Rakuten API response into Observation objects.
    """

    observations: list[Observation] = []

    for wrapper in raw_json.get("Items", []):

        item = wrapper.get("Item", {})

        observations.append(
            create_observation(item)
        )

    return observations