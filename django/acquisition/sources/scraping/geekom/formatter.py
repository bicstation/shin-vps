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


def normalize(html: str) -> str:
    """
    Normalize HTML without changing semantic meaning.
    """

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    #
    # Remove script/style
    #

    for tag in soup(["script", "style"]):
        tag.decompose()

    #
    # Remove HTML comments
    #

    for comment in soup.find_all(
        string=lambda text: isinstance(text, Comment)
    ):
        comment.extract()

    #
    # Normalize attributes
    #

    for tag in soup.find_all(True):

        attrs = {}

        for key, value in tag.attrs.items():

            if value in (None, "", [], {}):

                continue

            attrs[key] = value

        tag.attrs = attrs

    return str(soup)