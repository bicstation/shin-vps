# /home/maya/shin-dev/shin-vps/django/acquisition/common/trace/error.py
# ============================================================================
# FILE:
# acquisition/common/trace/error.py
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================
"""
SHIN CORE LINX
Reality Trace Error

Responsibilities
----------------
Display runtime error information.

DO
--
- Display error summaries
- Display expected/actual values
- Display exception information

DO NOT
-------
- Raise exceptions
- Handle exceptions
- Perform logging
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

def print_error(
    title: str,
    message: str,
    *,
    stage: str | None = None,
    field: str | None = None,
    expected: Any = None,
    actual: Any = None,
    exception: Exception | None = None,
) -> None:
    """
    Print runtime error information.

    Example
    -------
    🌌 REALITY TRACE :: ERROR

    Stage
      MODEL_MAPPER

    Field
      unique_id

    Expected
      ARK_B-A5M_72002746

    Actual
      ARK
    """

    print_header(f"{title} ERROR")

    print(f"Message : {message}")

    if stage is not None:
        print(f"Stage   : {stage}")

    if field is not None:
        print(f"Field   : {field}")

    if expected is not None:
        print(f"Expected: {expected}")

    if actual is not None:
        print(f"Actual  : {actual}")

    if exception is not None:
        print()
        print("Exception")
        print("---------")
        print(type(exception).__name__)
        print(exception)

    print_footer()