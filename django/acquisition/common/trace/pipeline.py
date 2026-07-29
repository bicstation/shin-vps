# ============================================================================
# FILE:
# acquisition/common/trace/pipeline.py
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================
"""
SHIN CORE LINX
Reality Trace Pipeline

Responsibilities
----------------
Control Reality Trace execution.

DO
--
- Control trace execution
- Dispatch trace modules
- Define pipeline stages
- Print pipeline progress

DO NOT
-------
- Build summaries
- Build diffs
- Render runtime data
- Business logic
"""

from __future__ import annotations

from typing import (
    Any,
    Iterable,
)

from .detail import (
    print_detail,
)

from .diff import (
    print_diff,
)

from .filter import (
    is_target,
)

from .printer import (
    print_footer,
    print_header,
)

from .runtime import (
    TRACE_ENABLED,
    TRACE_LEVEL,
)

from .summary import (
    print_summary,
)

# =============================================================================
# Default Pipeline
# =============================================================================

DEFAULT_PIPELINE: tuple[str, ...] = (
    "FETCH",
    "FORMATTER",
    "MAPPER",
    "CONTRACT",
    "NORMALIZED",
    "BUILDER",
    "SEMANTIC",
    "MODEL_MAPPER",
    "SAVE",
)

# =============================================================================
# Public API
# =============================================================================

def trace_runtime(
    stage: str,
    runtime: Any,
) -> None:
    """
    Execute Reality Trace pipeline.
    """

    #
    # Master Switch
    #

    if not TRACE_ENABLED:
        return

    #
    # Target Filter
    #

    if not is_target(runtime):
        return

    #
    # Trace Level
    #

    if TRACE_LEVEL <= 0:
        return

    #
    # Summary
    #

    if TRACE_LEVEL >= 1:
        print_summary(stage, runtime)

    #
    # Detail
    #

    if TRACE_LEVEL >= 2:
        print_detail(stage, runtime)

    #
    # Diff
    #

    if TRACE_LEVEL >= 4:
        print_diff(stage, runtime)

    #
    # Pipeline
    #

    if TRACE_LEVEL >= 4:
        print_pipeline(stage)


# =============================================================================
# Pipeline View
# =============================================================================

def print_pipeline(
    current_stage: str,
    pipeline: Iterable[str] | None = None,
) -> None:
    """
    Print pipeline execution progress.

    Example
    -------
    🌌 REALITY PIPELINE

    ✓ FETCH
    ✓ FORMATTER
    ▶ MAPPER
      CONTRACT
      NORMALIZED
      BUILDER
      SEMANTIC
      MODEL_MAPPER
      SAVE
    """

    stages = tuple(pipeline or DEFAULT_PIPELINE)

    print_header("PIPELINE")

    passed_current = False

    for stage in stages:

        if stage == current_stage:
            print(f"▶ {stage}")
            passed_current = True
            continue

        if not passed_current:
            print(f"✓ {stage}")
        else:
            print(f"  {stage}")

    print_footer()


# =============================================================================
# Helper
# =============================================================================

def has_stage(
    stage: str,
    pipeline: Iterable[str] | None = None,
) -> bool:
    """
    Return True if stage exists in the pipeline.
    """

    stages = tuple(pipeline or DEFAULT_PIPELINE)

    return stage in stages