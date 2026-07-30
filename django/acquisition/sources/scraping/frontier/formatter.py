#!/usr/bin/env python3
"""
==============================================================================
FRONTIER Formatter Runtime

Acquire HTML
        │
        ▼
Normalize HTML
        │
        ▼
Observation Runtime

Responsibilities

- Runtime Safety
- HTML Normalization
- Site-specific Preprocessing

Not Responsibilities

- HTML Parsing
- Reality Observation
- Semantic Extraction
==============================================================================
"""

from __future__ import annotations


# ==============================================================================
# Formatter
# ==============================================================================

def normalize(
    html: str,
) -> str:
    """
    Normalize HTML before Observation Runtime.

    Reserved for:

        - Whitespace cleanup
        - HTML normalization
        - Script removal
        - Site-specific preprocessing

    This Runtime intentionally performs no transformation
    until normalization becomes necessary.
    """

    return html