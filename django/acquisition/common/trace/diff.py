# ============================================================================
# FILE:
# acquisition/common/trace/diff.py
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================
"""
SHIN CORE LINX
Reality Trace Diff

Responsibilities
----------------
Build and display runtime differences.

DO
--
- Compare runtime dictionaries
- Build runtime diff data
- Delegate diff rendering

DO NOT
-------
- Print full runtime objects
- Filter runtime
- Generate summaries
- Business logic
"""

from __future__ import annotations

from typing import Any

from .printer import (
    print_footer,
    print_header,
)


# =============================================================================
# Public API
# =============================================================================

def build_diff(
    previous: dict[str, Any],
    current: dict[str, Any],
) -> dict[str, tuple[Any, Any]]:
    """
    Build runtime differences.

    Returns
    -------
    {
        "price": ("129,800 円", 129800),
        "unique_id": ("ARK", "ARK_B-A5M_72002746"),
    }
    """

    diff: dict[str, tuple[Any, Any]] = {}

    keys = set(previous.keys()) | set(current.keys())

    for key in sorted(keys):

        before = previous.get(key)
        after = current.get(key)

        if before != after:
            diff[key] = (
                before,
                after,
            )

    return diff


def print_diff(
    title: str,
    previous: dict[str, Any],
    current: dict[str, Any],
) -> None:
    """
    Print runtime differences.
    """

    print_header(f"{title} DIFF")

    diff = build_diff(
        previous,
        current,
    )

    if not diff:
        print("No changes.")
        print_footer()
        return

    for key, (before, after) in diff.items():

        print(key)
        print(f"  BEFORE : {before}")
        print(f"  AFTER  : {after}")
        print()

    print_footer()