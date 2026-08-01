#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/runtime/genre/genre_classifier.py

SHIN CORE LINX
Genre Runtime Classifier

Responsibilities

- Resolve Product Genre
- Resolve Unified Genre
- Read Genre Runtime TSVs

NOT

- AI
- Database
- Semantic Runtime
==============================================================================
"""

from __future__ import annotations

import csv
from pathlib import Path


BASE_DIR = Path(__file__).parent


class GenreClassifier:
    """
    Genre Runtime Classifier.
    """

    # ==========================================================
    # Initialize
    # ==========================================================

    def __init__(self) -> None:

        self.universes = self._load_tsv(
            "universes.tsv",
        )

        self.aliases = self._load_tsv(
            "aliases.tsv",
        )

        self.keywords = self._load_tsv(
            "keywords.tsv",
        )

        self.negative_aliases = self._load_tsv(
            "negative_aliases.tsv",
        )

    # ==========================================================
    # TSV Loader
    # ==========================================================

    def _load_tsv(
        self,
        filename: str,
    ) -> list[dict[str, str]]:

        path = BASE_DIR / filename

        if not path.exists():
            return []

        with path.open(
            encoding="utf-8",
            newline="",
        ) as fp:

            return list(
                csv.DictReader(
                    fp,
                    delimiter="\t",
                )
            )

    # ======================================================
    # Classify
    # ======================================================

    def classify(
        self,
        *,
        primary: str = "",
        secondary: str = "",
        keywords: str = "",
        description: str = "",
    ) -> dict[str, str]:

        tokens: list[str] = []

        #
        # Highest Priority
        #

        if keywords:

            tokens.extend(
                token.strip()
                for token in keywords.split("~~")
                if token.strip()
            )

        #
        # Category
        #

        if secondary:

            tokens.extend(
                token.strip()
                for token in secondary.split("~~")
                if token.strip()
            )

        #
        # Description
        #

        if description:

            tokens.append(
                description.strip(),
            )

        #
        # Lowest Priority
        #

        if primary:

            tokens.append(
                primary.strip(),
            )

        # ======================================================
        # TRACE
        # ======================================================

        print()
        print("=" * 70)
        print("GENRE CLASSIFIER INPUT")
        print("=" * 70)
        print(f"Primary     : {primary}")
        print(f"Secondary   : {secondary}")
        print(f"Keywords    : {keywords}")
        print(f"Description : {description}")
        print("-" * 70)
        print("TOKENS")

        for index, token in enumerate(
            tokens,
            start=1,
        ):

            print(
                f"{index:>2}. {token}"
            )

        print("=" * 70)

        # ======================================================
        # negative_aliases.tsv
        # ======================================================

        for token in tokens:

            for row in self.negative_aliases:

                keyword = row.get(
                    "keyword",
                    "",
                )

                if keyword and keyword in token:

                    print(
                        f"🚫 NEGATIVE MATCH : {keyword}"
                    )

                    return {

                        "raw_genre": "",

                        "unified_genre": "",

                    }

        # ======================================================
        # keywords.tsv
        # ======================================================

        for token in tokens:

            for row in self.keywords:

                keyword = row.get(
                    "keyword",
                    "",
                )

                if keyword and keyword in token:

                    print(
                        f"✅ KEYWORD MATCH : {keyword}"
                    )

                    print(
                        f"   raw_genre     : {row.get('raw_genre','')}"
                    )

                    print(
                        f"   unified_genre : {row.get('unified_genre','')}"
                    )

                    return {

                        "raw_genre": row.get(
                            "raw_genre",
                            "",
                        ),

                        "unified_genre": row.get(
                            "unified_genre",
                            "",
                        ),

                    }

        # ======================================================
        # aliases.tsv
        # ======================================================

        for token in tokens:

            for row in self.aliases:

                alias = row.get(
                    "alias",
                    "",
                )

                if alias and alias in token:

                    print(
                        f"✅ ALIAS MATCH : {alias}"
                    )

                    print(
                        f"   raw_genre     : {row.get('raw_genre','')}"
                    )

                    print(
                        f"   unified_genre : {row.get('unified_genre','')}"
                    )

                    return {

                        "raw_genre": row.get(
                            "raw_genre",
                            "",
                        ),

                        "unified_genre": row.get(
                            "unified_genre",
                            "",
                        ),

                    }

        # ======================================================
        # Fallback
        # ======================================================

        print("⚠️ GENRE FALLBACK")
        print(f"Primary : {primary}")
        print(f"Tokens  : {tokens}")
        print("=" * 70)

        return {

            "raw_genre": primary,

            "unified_genre": primary,

        }
