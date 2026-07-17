# /home/maya/shin-dev/shin-vps/django/research/rakuten_reality/scripts/formatter.py

"""
Rakuten Reality Research

Formatter

Responsibility
--------------
Display Reality Observation results.

This module MUST NOT:

- Call APIs
- Generate Observations
- Validate Data
- Map Payloads
- Save Files
"""

from __future__ import annotations

from typing import Any


def print_header() -> None:
    """
    Print application header.
    """

    print("=" * 60)
    print("Rakuten Reality Research")
    print("=" * 60)
    print()


def print_summary(
    raw_json: dict[str, Any],
) -> None:
    """
    Print response summary.
    """

    items = raw_json.get("Items", [])

    print("Summary")
    print("-" * 60)
    print(f"Products : {len(items)}")
    print()


def print_products(
    raw_json: dict[str, Any],
) -> None:
    """
    Print product list.
    """

    items = raw_json.get("Items", [])

    if not items:
        print("No products found.")
        print()
        return

    print("Products")
    print("-" * 60)

    for index, wrapper in enumerate(items, start=1):

        item = wrapper.get("Item", {})

        print(f"[{index}]")
        print(f"Name  : {item.get('itemName', '')}")
        print(f"Price : {item.get('itemPrice', '')}")
        print(f"Shop  : {item.get('shopName', '')}")
        print(f"Code  : {item.get('itemCode', '')}")
        print(f"URL   : {item.get('itemUrl', '')}")
        print("-" * 60)


def print_footer() -> None:
    """
    Print application footer.
    """

    print()
    print("=" * 60)
    print("Finished")
    print("=" * 60)