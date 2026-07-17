# /home/maya/shin-dev/shin-vps/django/research/rakuten_reality/scripts/mapper.py

"""
Rakuten Reality Research

Mapper

Responsibility
--------------
Convert Observation objects into payload dictionaries.

This module MUST NOT:

- Call APIs
- Generate Observations
- Validate Data
- Save Files
"""

from __future__ import annotations

from observation_contract import Observation


def to_payload(
    observation: Observation,
) -> dict:
    """
    Convert an Observation into a payload dictionary.
    """

    return {
        "source": observation.source,
        "source_product_id": observation.source_product_id,
        "shop_code": observation.shop_code,
        "shop_name": observation.shop_name,
        "maker": observation.maker,
        "name": observation.name,
        "price": observation.price,
        "review_average": observation.review_average,
        "review_count": observation.review_count,
        "product_url": observation.product_url,
        "primary_image_url": observation.primary_image_url,
        "image_urls": observation.image_urls,
        "description": observation.description,
        "cpu": observation.cpu,
        "gpu": observation.gpu,
        "memory": observation.memory,
        "storage": observation.storage,
        "display": observation.display,
        "resolution": observation.resolution,
        "refresh_rate": observation.refresh_rate,
        "weight": observation.weight,
        "battery": observation.battery,
        "npu": observation.npu,
        "operating_system": observation.operating_system,
        "wireless": observation.wireless,
    }


def to_payloads(
    observations: list[Observation],
) -> list[dict]:
    """
    Convert Observation objects into payload dictionaries.
    """

    return [
        to_payload(observation)
        for observation in observations
    ]