# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/observe.py

from __future__ import annotations

import json
from pathlib import Path


RAW_DIR = (
    Path(__file__).resolve().parent.parent
    / "output"
    / "raw"
)

OBSERVATION_DIR = (
    Path(__file__).resolve().parent.parent
    / "output"
    / "observation"
)


def load_raw(filename: str) -> dict:
    """
    Load raw API response.
    """

    path = RAW_DIR / filename

    with path.open(
        "r",
        encoding="utf-8",
    ) as fp:
        return json.load(fp)


def observe(data: dict) -> dict:
    """
    Observe ProductDB response without modifying Reality.
    """

    products = data.get("items", [])

    observation = {
        "product_count": len(products),
        "response_keys": sorted(data.keys()),
        "sample_keys": (
            sorted(products[0].keys())
            if products
            else []
        ),
        "sample": (
            {
                "title": products[0].get("title"),
                "merchantName": products[0].get("merchantName"),
                "brand_name": products[0].get("brand_name"),
                "janCode": products[0].get("janCode"),
                "modelCode": products[0].get("modelCode"),
                "productCode": products[0].get("productCode"),
                "price": products[0].get("price"),
                "guid": products[0].get("guid"),
                "link": products[0].get("link"),
            }
            if products
            else {}
        ),
    }

    return observation


def save_observation(
    observation: dict,
    filename: str,
) -> Path:

    OBSERVATION_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    path = OBSERVATION_DIR / filename

    with path.open(
        "w",
        encoding="utf-8",
    ) as fp:
        json.dump(
            observation,
            fp,
            ensure_ascii=False,
            indent=2,
        )

    return path


def main() -> None:

    data = load_raw(
        "thinkpad.json",
    )

    observation = observe(data)

    path = save_observation(
        observation,
        "thinkpad_observation.json",
    )

    print(f"Saved: {path}")


if __name__ == "__main__":
    main()