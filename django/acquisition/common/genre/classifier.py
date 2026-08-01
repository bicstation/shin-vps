# /home/maya/shin-dev/shin-vps/django/acquisition/common/genre/classifier.py

#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/common/genre/classifier.py

SHIN CORE LINX
Genre Runtime Classifier

Responsibilities

- Classify Product Genre
- Resolve Genre from Reality
- Keyword-based Classification

NOT

- TSV Loading
- Semantic Runtime
- Database
- AI
==============================================================================
"""

from __future__ import annotations


class GenreClassifier:
    """
    Genre Classification Runtime.

    Current
    -------
    Rule-based keyword classification.

    Future
    ------
    - TSV Rules
    - Alias Runtime
    - Semantic Universe Mapping
    """

    def classify(
        self,
        *,
        primary: str,
        secondary: str,
        keywords: str,
    ) -> dict[str, str]:

        #
        # Normalize
        #

        text = " ".join(
            [
                primary or "",
                secondary or "",
                keywords or "",
            ]
        )

        #
        # Device
        #

        if "モニター" in text:

            return {
                "raw_genre": "モニター",
                "unified_genre": "monitor",
            }

        if "ノートパソコン" in text:

            return {
                "raw_genre": "ノートパソコン",
                "unified_genre": "device",
            }

        if "デスクトップ" in text:

            return {
                "raw_genre": "デスクトップパソコン",
                "unified_genre": "device",
            }

        #
        # Fallback
        #

        return {

            "raw_genre": primary,

            "unified_genre": primary,

        }