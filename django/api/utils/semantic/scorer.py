# /home/maya/shin-dev/shin-vps/django/api/utils/semantic/scorer.py

# =========================================================
# SHIN CORE LINX｜Semantic Scorer
# /api/utils/semantic/scorer.py
# =========================================================


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

    "hardware": 0.7,

    "software": 0.7,

    "spec": 0.8,
}


# =========================================================
# Calculate Alias Score
# =========================================================

def calculate_alias_score(

    alias_type="canonical",

    match_strength=1.0
):

    type_weight = (
        ALIAS_TYPE_WEIGHTS.get(
            alias_type,
            0.5
        )
    )

    return (
        float(match_strength)
        * float(type_weight)
    )