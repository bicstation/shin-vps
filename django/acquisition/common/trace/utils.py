# /home/maya/shin-dev/shin-vps/django/acquisition/common/trace/utils.py
# ============================================================================
# FILE:
# acquisition/common/trace/utils.py
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================
"""
SHIN CORE LINX
Reality Trace Utilities

Responsibilities
----------------
Utility helpers for runtime trace.

DO
--
- Safe dictionary access
- Nested value extraction
- Simple type conversion

DO NOT
-------
- Print output
- Filter runtime
- Generate summaries
- Business logic
"""

from __future__ import annotations

from typing import Any


# =============================================================================
# Safe Get
# =============================================================================

def safe_get(
    data: dict[str, Any] | None,
    key: str,
    default: Any = None,
) -> Any:
    """
    Safely retrieve a value from a dictionary.
    """

    if not isinstance(data, dict):
        return default

    return data.get(key, default)


# =============================================================================
# Nested Get
# =============================================================================

def nested_get(
    data: dict[str, Any] | None,
    *keys: str,
    default: Any = None,
) -> Any:
    """
    Safely retrieve a nested value.

    Example
    -------
    nested_get(contract, "identity", "product_no")
    """

    current: Any = data

    for key in keys:

        if not isinstance(current, dict):
            return default

        current = current.get(key)

        if current is None:
            return default

    return current


# =============================================================================
# Type Conversion
# =============================================================================

def as_str(value: Any) -> str | None:
    """
    Convert value to string.

    None remains None.
    """

    if value is None:
        return None

    return str(value)


def as_int(value: Any) -> int | None:
    """
    Convert value to integer.

    Returns None on failure.
    """

    if value is None:
        return None

    try:
        return int(value)
    except (TypeError, ValueError):
        return None


# =============================================================================
# Runtime Helpers
# =============================================================================

def has_value(value: Any) -> bool:
    """
    Return True if value should be considered present.
    """

    return value not in (
        None,
        "",
        [],
        {},
    )


def is_mapping(value: Any) -> bool:
    """
    Return True if value is a dictionary.
    """

    return isinstance(value, dict)