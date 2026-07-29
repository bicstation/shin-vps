# ============================================================================
# FILE:
# acquisition/common/trace/themes/verbose.py
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================
"""
SHIN CORE LINX
Reality Trace Verbose Theme

Responsibilities
----------------
Define verbose console theme settings.

DO
--
- Define display constants
- Define display symbols
- Define layout settings
- Define display titles
- Define verbose options

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

THEME_NAME = "verbose"

# =============================================================================
# Layout
# =============================================================================

LINE_WIDTH = 100

HEADER_LINE = "═" * LINE_WIDTH

SECTION_LINE = "─"

INDENT = "    "

KEY_WIDTH = 28

# =============================================================================
# Pipeline Symbols
# =============================================================================

SYMBOL_DONE = "✔"

SYMBOL_CURRENT = "▶"

SYMBOL_PENDING = "·"

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

SYMBOL_CHANGED = "⇒"

# =============================================================================
# Display Titles
# =============================================================================

TRACE_TITLE = "🌌 SHIN CORE LINX REALITY TRACE"

PIPELINE_TITLE = "PIPELINE"

SUMMARY_TITLE = "SUMMARY"

DETAIL_TITLE = "DETAIL"

DIFF_TITLE = "DIFF"

ERROR_TITLE = "ERROR"

# =============================================================================
# Verbose Options
# =============================================================================

SHOW_SECTION_SEPARATOR = True

SHOW_EMPTY_FIELDS = True

SHOW_OBJECT_TYPE = True

SHOW_LINE_NUMBERS = False

SHOW_STAGE_NAME = True

SHOW_RUNTIME_NAME = True