# ============================================================================
# FILE:
# acquisition/common/trace/printer.py
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================
"""
SHIN CORE LINX
Reality Trace Printer

Responsibilities
----------------
Render trace output to the console.

DO
--
- Print trace headers
- Print trace sections
- Print key/value tables
- Render runtime objects

DO NOT
-------
- Filter runtime
- Analyze runtime
- Generate summaries
- Generate diffs
- Business logic
"""

from __future__ import annotations

from pprint import pprint
from typing import Any

# =============================================================================
# Constants
# =============================================================================

LINE_WIDTH = 70
LINE = "━" * LINE_WIDTH


# =============================================================================
# Header / Footer
# =============================================================================

def print_header(title: str) -> None:
    """
    Print trace header.

    Example
    -------
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    🌌 REALITY TRACE :: BUILDER
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    """
    print()
    print(LINE)
    print(f"🌌 REALITY TRACE :: {title}")
    print(LINE)


def print_footer() -> None:
    """
    Print trace footer.
    """
    print(LINE)
    print()


# =============================================================================
# Sections
# =============================================================================

def print_section(title: str) -> None:
    """
    Print section title.

    Example
    -------
    FORMATTER
    ---------
    """
    print()
    print(title)
    print("-" * len(title))


# =============================================================================
# Key / Value
# =============================================================================

def print_key_value(
    key: str,
    value: Any,
) -> None:
    """
    Print a single key/value pair.
    """
    print(f"{key:<20}: {value}")


def print_table(
    data: dict[str, Any],
) -> None:
    """
    Print dictionary as key/value table.
    """
    for key, value in data.items():
        print_key_value(key, value)


# =============================================================================
# Object
# =============================================================================

def print_object(obj: Any) -> None:
    """
    Render arbitrary Python object.
    """
    pprint(
        obj,
        sort_dicts=False,
        width=120,
    )