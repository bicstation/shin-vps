# ============================================================================
# FILE:
# acquisition/common/trace/summary.py
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================
"""
SHIN CORE LINX
Reality Trace Summary

Responsibilities
----------------
Build compact runtime summaries.

DO
--
- Extract important runtime fields
- Build compact summary data
- Delegate summary rendering

DO NOT
-------
- Print full runtime objects
- Generate diffs
- Filter runtime
- Business logic
"""

from __future__ import annotations

from typing import Any

from .printer import (
    print_footer,
    print_header,
    print_table,
)

from .utils import (
    nested_get,
)

# =============================================================================
# Summary Fields
# =============================================================================

SUMMARY_FIELDS = (
    ("product_no", ("product_no",)),
    ("pc_id", ("pc_id",)),
    ("unique_id", ("unique_id",)),
    ("name", ("product_name",)),
    ("maker", ("maker",)),
    ("brand", ("brand",)),
    ("price", ("price",)),
    ("affiliate_url", ("affiliate_url",)),
)

# =============================================================================
# Public API
# =============================================================================

def build_summary(
    runtime: Any,
) -> dict[str, Any]:
    """
    Build compact summary from supported runtime structures.
    """

    summary: dict[str, Any] = {}

    # -------------------------------------------------------------------------
    # Priority Order
    #
    # 1. Django Model
    # 2. Runtime
    # 3. Integration Contract
    # -------------------------------------------------------------------------

    #
    # Django Model
    #

    if hasattr(runtime, "_meta"):

        for field, _ in SUMMARY_FIELDS:

            value = getattr(runtime, field, None)

            if value is not None:
                summary[field] = value

        return summary

    #
    # Runtime
    #

    for field, path in SUMMARY_FIELDS:

        value = nested_get(runtime, *path)

        if value is not None:
            summary[field] = value

    #
    # Integration Contract
    #

    identity = runtime.get("identity")

    if isinstance(identity, dict):

        summary.setdefault(
            "product_no",
            identity.get("product_no"),
        )

        summary.setdefault(
            "pc_id",
            identity.get("pc_id"),
        )

        summary.setdefault(
            "unique_id",
            identity.get("unique_id"),
        )

        summary.setdefault(
            "name",
            identity.get("product_name"),
        )

        summary.setdefault(
            "maker",
            identity.get("maker"),
        )

        summary.setdefault(
            "brand",
            identity.get("brand"),
        )

    #
    # Commerce Runtime
    #

    commerce = runtime.get("commerce")

    if isinstance(commerce, dict):

        summary.setdefault(
            "price",
            commerce.get("price"),
        )

        summary.setdefault(
            "affiliate_url",
            commerce.get("affiliate_url"),
        )

    return summary


def print_summary(
    title: str,
    runtime: Any,
) -> None:
    """
    Print compact runtime summary.
    """

    print_header(title)

    summary = build_summary(runtime)

    print_table(summary)

    print_footer()