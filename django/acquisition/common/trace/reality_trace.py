# ============================================================================
# FILE:
# acquisition/common/trace/reality_trace.py
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================
"""
SHIN CORE LINX
Reality Trace

Responsibilities
----------------
Public Reality Trace API.

DO
--
- Provide public trace entry points
- Delegate to pipeline
- Preserve stable public API

DO NOT
-------
- Runtime filtering
- Trace level control
- Runtime analysis
- Console rendering
- Business logic
"""

from __future__ import annotations

from typing import Any

from .pipeline import (
    trace_runtime,
    print_pipeline,
)

from .error import (
    print_error,
)

# =============================================================================
# Public API
# =============================================================================

def trace_model(
    stage: str,
    obj: Any,
) -> None:
    """
    Display persisted model summary.
    """

    trace_runtime(
        stage=stage,
        runtime=obj,
    )

def trace(
    stage: str,
    data: Any,
) -> None:
    """
    Execute Reality Trace.
    """

    trace_runtime(
        stage=stage,
        runtime=data,
    )


def trace_pipeline(
    current_stage: str,
) -> None:
    """
    Display pipeline progress.
    """

    print_pipeline(current_stage)


def trace_error(
    title: str,
    message: str,
    **kwargs: Any,
) -> None:
    """
    Display runtime error.
    """

    print_error(
        title,
        message,
        **kwargs,
    )