# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/validator.py

from __future__ import annotations

from typing import Any


REQUIRED_KEYS = (
    "product_count",
    "response_keys",
    "sample_keys",
    "sample",
)


def validate(
    observation: dict[str, Any],
) -> tuple[bool, list[str]]:
    """
    Validate Observation structure.
    """

    errors: list[str] = []

    for key in REQUIRED_KEYS:
        if key not in observation:
            errors.append(f"Missing key: {key}")

    if not isinstance(
        observation.get("product_count"),
        int,
    ):
        errors.append("product_count must be int")

    if not isinstance(
        observation.get("response_keys"),
        list,
    ):
        errors.append("response_keys must be list")

    if not isinstance(
        observation.get("sample_keys"),
        list,
    ):
        errors.append("sample_keys must be list")

    if not isinstance(
        observation.get("sample"),
        dict,
    ):
        errors.append("sample must be dict")

    return (
        len(errors) == 0,
        errors,
    )


if __name__ == "__main__":

    sample = {
        "product_count": 1,
        "response_keys": [],
        "sample_keys": [],
        "sample": {},
    }

    valid, errors = validate(sample)

    print(valid)

    if errors:
        print(errors)