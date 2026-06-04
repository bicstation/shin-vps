# /home/maya/shin-dev/shin-vps/django/api/utils/semantic/runtime.py

# =========================================================
# SHIN CORE LINX｜Semantic Runtime
# /api/utils/semantic/runtime.py
# =========================================================

from collections import defaultdict

from api.utils.semantic.loader import (
    load_aliases
)

from api.utils.semantic.normalizer import (
    normalize_text
)


# =========================================================
# Alias Type Weights
# =========================================================

ALIAS_TYPE_WEIGHTS = {

    "canonical": 1.0,

    "shorthand": 0.9,

    "model": 0.8,

    "marketing": 0.6,

    "series": 0.75,

    "brand": 0.7,

    "category": 0.65,

    "feature": 0.6,
}


# =========================================================
# Runtime
# =========================================================

def run_semantic_runtime(text):

    aliases = load_aliases()

    normalized_text = normalize_text(
        text
    )

    scores = defaultdict(float)

    matched_aliases = []


    # =====================================================
    # Match
    # =====================================================

    for row in aliases:

        slug = row.get("slug", "")

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

        match_strength = float(
            row.get(
                "match_strength",
                1.0
            )
        )

        if not alias:
            continue

        if alias in normalized_text:

            type_weight = (
                ALIAS_TYPE_WEIGHTS.get(
                    alias_type,
                    0.5
                )
            )

            score = (
                match_strength
                * type_weight
            )

            scores[slug] += score

            matched_aliases.append({

                "slug": slug,

                "alias": alias,

                "alias_type": alias_type,

                "match_strength": match_strength,

                "score": score,
            })


    # =====================================================
    # Finalize
    # =====================================================

    sorted_scores = sorted(

        scores.items(),

        key=lambda x: x[1],

        reverse=True
    )


    # =====================================================
    # Debug Result
    # =====================================================

    result = {

        "raw_text": text,

        "normalized_text": normalized_text,

        "scores": dict(scores),

        "sorted_scores": sorted_scores,

        "matched_aliases": matched_aliases,
    }

    return result