# ============================================================================
# FILE:
# acquisition/common/trace/themes/compact.py
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================
"""
SHIN CORE LINX
Reality Trace Compact Theme

Responsibilities
----------------
Define compact console theme settings.

DO
--
- Define display constants
- Define display symbols
- Define layout settings
- Define display titles

DO NOT
-------
- Print output
- Filter runtime
- Business logic
"""

from __future__ import annotations

# =============================================================================
# Theme Information
# =============================================================================

THEME_NAME = "compact"

# =============================================================================
# Layout
# =============================================================================

LINE_WIDTH = 70

HEADER_LINE = "━" * LINE_WIDTH

SECTION_LINE = "-"

INDENT = "  "

KEY_WIDTH = 20

# =============================================================================
# Pipeline Symbols
# =============================================================================

SYMBOL_DONE = "✓"

SYMBOL_CURRENT = "▶"

SYMBOL_PENDING = " "

# =============================================================================
# Runtime Symbols
# =============================================================================

SYMBOL_INFO = "ℹ"

SYMBOL_WARNING = "⚠"

SYMBOL_ERROR = "✖"

# =============================================================================
# Diff Symbols
# =============================================================================

SYMBOL_BEFORE = "◀"

SYMBOL_AFTER = "▶"

SYMBOL_CHANGED = "→"

# =============================================================================
# Display Titles
# =============================================================================

TRACE_TITLE = "🌌 REALITY TRACE"

PIPELINE_TITLE = "PIPELINE"

SUMMARY_TITLE = "SUMMARY"

DETAIL_TITLE = "DETAIL"

DIFF_TITLE = "DIFF"

ERROR_TITLE = "ERROR"