# =========================================================
# SHIN CORE LINX｜Semantic Matcher
# /api/utils/semantic/matcher.py
# =========================================================

import re

from api.utils.semantic.loader import (
    load_aliases
)


# =========================================================
# Match Aliases
# =========================================================

def match_aliases(normalized_text):

    aliases = load_aliases()

    matches = []

    for row in aliases:

        slug = (
            row.get("slug", "")
            .strip()
        )

        alias = (
            row.get("alias", "")
            .strip()
            .lower()
        )

        alias_type = (
            row.get(
                "alias_type",
                "canonical"
            )
            .strip()
            .lower()
        )

        # =================================================
        # Match Strength
        # =================================================

        try:

            match_strength = float(
                row.get(
                    "match_strength",
                    1.0
                )
            )

        except Exception:

            match_strength = 1.0


        # =================================================
        # Adult Flag
        # =================================================

        try:

            is_adult = int(
                row.get(
                    "is_adult",
                    0
                )
            )

        except Exception:

            is_adult = 0


        # =================================================
        # Empty Alias Skip
        # =================================================

        if not alias:
            continue


        # =================================================
        # Strict Token Boundary Match
        # =================================================

        pattern = (
            rf"(?<![a-zA-Z0-9])"
            rf"{re.escape(alias)}"
            rf"(?![a-zA-Z0-9])"
        )


        # =================================================
        # Match
        # =================================================

        if re.search(pattern, normalized_text):

            matches.append({

                "slug": slug,

                "alias": alias,

                "alias_type": alias_type,

                "match_strength": match_strength,

                "is_adult": is_adult,
            })


    return matches