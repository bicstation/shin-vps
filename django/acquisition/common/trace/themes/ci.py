# ============================================================================
# FILE:
# acquisition/common/trace/themes/ci.py
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================
"""
SHIN CORE LINX
Reality Trace CI Theme

Responsibilities
----------------
Define CI console theme settings.

Designed for
------------
- GitHub Actions
- GitLab CI
- Jenkins
- Docker Logs
- Log Parsing

DO
--
- Define display constants
- Define ASCII-friendly symbols
- Define layout settings
- Define display titles
- Define CI options

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

THEME_NAME = "ci"

# =============================================================================
# Layout
# =============================================================================

LINE_WIDTH = 80

HEADER_LINE = "=" * LINE_WIDTH

SECTION_LINE = "-"

INDENT = "  "

KEY_WIDTH = 24

# =============================================================================
# Pipeline Symbols
# =============================================================================

SYMBOL_DONE = "[OK]"

SYMBOL_CURRENT = "[RUN]"

SYMBOL_PENDING = "[ ]"

# =============================================================================
# Runtime Symbols
# =============================================================================

SYMBOL_INFO = "[INFO]"

SYMBOL_WARNING = "[WARN]"

SYMBOL_ERROR = "[ERROR]"

# =============================================================================
# Diff Symbols
# =============================================================================

SYMBOL_BEFORE = "<"

SYMBOL_AFTER = ">"

SYMBOL_CHANGED = "->"

# =============================================================================
# Display Titles
# =============================================================================

TRACE_TITLE = "SHIN CORE LINX REALITY TRACE"

PIPELINE_TITLE = "PIPELINE"

SUMMARY_TITLE = "SUMMARY"

DETAIL_TITLE = "DETAIL"

DIFF_TITLE = "DIFF"

ERROR_TITLE = "ERROR"

# =============================================================================
# CI Options
# =============================================================================

SHOW_SECTION_SEPARATOR = True

SHOW_EMPTY_FIELDS = True

SHOW_OBJECT_TYPE = False

SHOW_LINE_NUMBERS = False

SHOW_STAGE_NAME = True

SHOW_RUNTIME_NAME = True

USE_ASCII_ONLY = True

USE_COLOR = False

USE_EMOJI = False