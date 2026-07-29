# /home/maya/shin-dev/shin-vps/django/acquisition/common/trace/detail.py
# ============================================================================
# FILE:
# acquisition/common/trace/detail.py
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================
"""
SHIN CORE LINX
Reality Trace Detail

Responsibilities
----------------
Display complete runtime objects.

DO
--
- Display full runtime data
- Pretty-print dictionaries
- Pretty-print objects

DO NOT
-------
- Filter runtime
- Generate summaries
- Generate diffs
- Business logic
"""

from __future__ import annotations

from typing import Any

from .printer import (
    print_footer,
    print_header,
    print_object,
)


# =============================================================================
# Public API
# =============================================================================

def print_detail(
    title: str,
    runtime: Any,
) -> None:
    """
    Print complete runtime object.

    Example
    -------
    🌌 REALITY TRACE :: BUILDER DETAIL

    {
        ...
    }
    """

    print_header(f"{title} DETAIL")

    print_object(runtime)

    print_footer()