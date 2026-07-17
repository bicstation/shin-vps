# /home/maya/shin-dev/shin-vps/django/research/rakuten_reality/scripts/validator.py

"""
Rakuten Reality Research

Validator

Responsibility
--------------
Validate Observation objects.

This module MUST NOT:

- Call APIs
- Generate Observations
- Map Payloads
- Save Files
"""

from __future__ import annotations

from observation_contract import Observation


def validate(
    observation: Observation,
) -> list[str]:
    """
    Validate an Observation.

    Returns
    -------
    list[str]
        Empty list means valid.
    """

    errors: list[str] = []

    # ==========================================================
    # Required Fields
    # ==========================================================

    if not observation.source:
        errors.append("source is required.")

    if not observation.source_product_id:
        errors.append("source_product_id is required.")

    if not observation.name:
        errors.append("name is required.")

    # ==========================================================
    # Numeric Values
    # ==========================================================

    if (
        observation.price is not None
        and observation.price < 0
    ):
        errors.append("price must be >= 0.")

    if (
        observation.review_average is not None
        and observation.review_average < 0
    ):
        errors.append("review_average must be >= 0.")

    if (
        observation.review_count is not None
        and observation.review_count < 0
    ):
        errors.append("review_count must be >= 0.")

    return errors


def is_valid(
    observation: Observation,
) -> bool:
    """
    Return True if Observation is valid.
    """

    return len(validate(observation)) == 0