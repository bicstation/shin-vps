# ============================================================================
# FILE:
# acquisition/common/trace/filter.py
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================
"""
SHIN CORE LINX
Reality Trace Filter

Responsibilities
----------------
Determine whether runtime data should be traced.

DO
--
- Extract runtime identifiers
- Match target product
- Filter trace output

DO NOT
-------
- Print output
- Modify runtime data
- Generate summaries
- Business logic
"""

from __future__ import annotations

from typing import Any

# =============================================================================
# Trace Target
# =============================================================================

from .runtime import TRACE_PRODUCT_NO

# =============================================================================
# Public API
# =============================================================================

def is_target(data: Any) -> bool:
    """
    Return True if the runtime object should be traced.

    If TRACE_PRODUCT_NO is None,
    every runtime object is traced.
    """

    if TRACE_PRODUCT_NO is None:
        return True

    product_no = extract_product_no(data)

    if product_no is None:
        return False

    return str(product_no) == str(TRACE_PRODUCT_NO)


# =============================================================================
# Identifier Extraction
#
# Priority Order
#
# 1. Runtime Object
# 2. Runtime Contract
# 3. Django Mapping
# =============================================================================

def extract_product_no(data: Any) -> str | None:
    """
    Extract product number from supported runtime structures.
    """

    #
    # Runtime Object
    #

    if not isinstance(data, dict):
        value = getattr(data, "product_no", None)
        if value:
            return str(value)
        return None

    #
    # Runtime
    #

    value = data.get("product_no")
    if value:
        return str(value)

    #
    # Runtime Contract
    #

    identity = data.get("identity")
    if isinstance(identity, dict):
        value = identity.get("product_no")
        if value:
            return str(value)

    #
    # Django Mapping
    #

    value = data.get("pc_product_no")
    if value:
        return str(value)

    return None


def extract_pc_id(data: Any) -> str | None:
    """
    Extract pc_id from supported runtime structures.
    """

    #
    # Runtime Object
    #

    if not isinstance(data, dict):
        value = getattr(data, "pc_id", None)
        if value:
            return str(value)
        return None

    #
    # Runtime
    #

    value = data.get("pc_id")
    if value:
        return str(value)

    #
    # Runtime Contract
    #

    identity = data.get("identity")
    if isinstance(identity, dict):
        value = identity.get("pc_id")
        if value:
            return str(value)

    return None


def extract_unique_id(data: Any) -> str | None:
    """
    Extract unique_id from supported runtime structures.
    """

    #
    # Runtime Object
    #

    if not isinstance(data, dict):
        value = getattr(data, "unique_id", None)
        if value:
            return str(value)
        return None

    #
    # Runtime
    #

    value = data.get("unique_id")
    if value:
        return str(value)

    #
    # Runtime Contract
    #

    identity = data.get("identity")
    if isinstance(identity, dict):
        value = identity.get("unique_id")
        if value:
            return str(value)

    return None