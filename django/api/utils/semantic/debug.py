# /home/maya/shin-dev/shin-vps/django/api/utils/semantic/debug.py

# =========================================================
# SHIN CORE LINX｜Semantic Debug
# /api/utils/semantic/debug.py
# =========================================================

from pprint import pprint


# =========================================================
# Build Debug Result
# =========================================================

def build_debug_result(

    raw_text,

    normalized_text,

    matches,

    scores,
):

    sorted_scores = sorted(

        scores.items(),

        key=lambda x: x[1],

        reverse=True
    )

    return {

        "raw_text": raw_text,

        "normalized_text": normalized_text,

        "match_count": len(matches),

        "matched_aliases": matches,

        "scores": dict(scores),

        "sorted_scores": sorted_scores,
    }


# =========================================================
# Pretty Print
# =========================================================

def print_debug_result(result):

    pprint(result)