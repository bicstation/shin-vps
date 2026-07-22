# =========================================================
# FILE:
# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/formatter.py
# =========================================================

from __future__ import annotations

import json
from typing import Any


def format_json(data: Any) -> str:
    """
    Format object as pretty JSON.
    """

    return json.dumps(
        data,
        ensure_ascii=False,
        indent=2,
        sort_keys=False,
    )


def print_json(data: Any) -> None:
    """
    Pretty print JSON.
    """

    print(format_json(data))


def print_title(title: str) -> None:
    """
    Print section title.
    """

    print()
    print("=" * 80)
    print(title)
    print("=" * 80)


def print_summary(
    source: str,
    product_count: int,
    filename: str,
) -> None:
    """
    Print research summary.
    """

    print_title(source)

    print(f"Products : {product_count}")
    print(f"Output   : {filename}")