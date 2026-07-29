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
- Remove Script
- Remove Style
- Remove Comments
- Normalize Attributes

Reality First
Observation First
"""

from __future__ import annotations

from bs4 import BeautifulSoup
from bs4 import Comment

from acquisition.common.trace.reality_trace import trace


def normalize(html: str) -> str:
    """
    Normalize HTML without changing semantic meaning.
    """

    trace(
        "Formatter Input",
        {
            "html_length": len(html),
        },
    )

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    #
    # Remove script/style
    #

    script_count = 0

    for tag in soup(["script", "style"]):
        script_count += 1
        tag.decompose()

    #
    # Remove HTML comments
    #

    comment_count = 0

    for comment in soup.find_all(
        string=lambda text: isinstance(text, Comment)
    ):
        comment_count += 1
        comment.extract()

    #
    # Normalize attributes
    #

    attribute_removed = 0

    for tag in soup.find_all(True):

        attrs = {}

        for key, value in tag.attrs.items():

            if value in (None, "", [], {}):

                attribute_removed += 1
                continue

            attrs[key] = value

        tag.attrs = attrs

    normalized = str(soup)

    trace(
        "Formatter Output",
        {
            "html_length": len(normalized),
            "scripts_removed": script_count,
            "comments_removed": comment_count,
            "attributes_removed": attribute_removed,
        },
    )

    return normalized