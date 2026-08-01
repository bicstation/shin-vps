#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/common/genre/builder.py

SHIN CORE LINX
Genre Runtime Builder

Responsibilities

- Build Genre Runtime
- Normalize Category Runtime
- Execute Genre Classifier

NOT

- Genre Classification
- Semantic Runtime
- AI
- Database
==============================================================================
"""

from __future__ import annotations

from typing import Any

from acquisition.sources.runtime.genre.genre_classifier import (
    GenreClassifier,
)


class GenreBuilder:
    """
    Build Genre Runtime.

    Responsibilities
    ----------------
    Normalize Import Contract and
    delegate genre resolution to GenreClassifier.
    """

    def __init__(self) -> None:

        self.classifier = GenreClassifier()

    # ==========================================================
    # Build
    # ==========================================================

    def build(
        self,
        contract: dict[str, Any],
    ) -> dict[str, str]:

        #
        # Category Runtime
        #

        category = contract.get(
            "category",
            {},
        )

        #
        # Normalize
        #

        if isinstance(category, dict):

            primary = category.get(
                "primary",
                "",
            )

            secondary = category.get(
                "secondary",
                "",
            )

            keywords = category.get(
                "keywords",
                "",
            )

        else:

            primary = ""
            secondary = ""
            keywords = ""

        #
        # Genre Classifier
        #

        genre = self.classifier.classify(

            primary=primary,

            secondary=secondary,

            keywords=keywords,

        )

        # ==========================================================
        # DEBUG
        # ==========================================================

        print("=" * 60)
        print("GENRE BUILDER")
        print(f"primary       : {primary}")
        print(f"secondary     : {secondary}")
        print(f"keywords      : {keywords}")
        print(f"raw_genre     : {genre['raw_genre']}")
        print(f"unified_genre : {genre['unified_genre']}")
        print("=" * 60)

        return genre