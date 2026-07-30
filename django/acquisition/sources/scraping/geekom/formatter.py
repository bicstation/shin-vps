#!/usr/bin/env python3
"""
formatter.py

GEEKOM Formatter Runtime

AcquisitionDocument
        │
        ▼
Normalized HTML (Memory Only)

Responsibilities

- HTML Parse
- Remove HTML Comments
- Normalize HTML Attributes

NOT

- Parse Specifications
- Parse JSON-LD
- Parse Tables
- Generate Meaning
- Classify Reality

Reality First
Observation First
"""

from __future__ import annotations

from bs4 import BeautifulSoup
from bs4 import Comment

from acquisition.common.trace.reality_trace import trace


def normalize(html: str) -> str:
    """
    Normalize HTML while preserving observable Reality.
    """

    trace(
        "Formatter Input",
        {
            "html_length": len(html),
        },
    )

    #
    # HTML Parse
    #

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    #
    # Remove HTML Comments
    #

    comment_count = 0

    for comment in soup.find_all(
        string=lambda text: isinstance(text, Comment),
    ):
        comment_count += 1
        comment.extract()

    #
    # Normalize Attributes
    #

    attribute_removed = 0

    for tag in soup.find_all(True):

        attrs = {}

        for key, value in tag.attrs.items():

            if value in (
                None,
                "",
                [],
                {},
            ):
                attribute_removed += 1
                continue

            attrs[key] = value

        tag.attrs = attrs

    normalized = str(soup)

    trace(
        "Formatter Output",
        {
            "html_length": len(normalized),
            "comments_removed": comment_count,
            "attributes_removed": attribute_removed,
        },
    )

    return normalized