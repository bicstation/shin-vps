# /home/maya/shin-vps/django/acquisition/sources/scraping/frontier/formatter.py

#!/usr/bin/env python3
"""
==============================================================================
formatter.py

FRONTIER Formatter Runtime

HTML
    │
    ▼
normalize()
    │
    ▼
Observation Runtime

Reality First
Observation First
==============================================================================
"""

from __future__ import annotations


def normalize(html: str) -> str:
    """
    Normalize HTML before Observation.

    Reserved for:
        - whitespace cleanup
        - script removal
        - HTML normalization
        - site specific preprocessing

    Current implementation performs no transformation.
    """

    return html