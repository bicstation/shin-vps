# ==========================================================
# SHIN CORE LINX
# Semantic Contradiction Rules
# ==========================================================

"""
IMPORTANT:

These rules prevent semantic universe contamination.

Positive semantic detection alone is insufficient.

We also need semantic contradiction filtering.

Example:

"desktop"
→ contradicts mobility workflow

These rules are intentionally conservative.

Current phase:
semantic runtime stabilization
"""

# ==========================================================
# MOBILITY
# ==========================================================

"""
Mobility workflow should represent:

- portable devices
- lightweight usage
- notebook-oriented exploration
- travel/cafe/business mobility

These keywords indicate contradiction against mobility.
"""

MOBILITY_NEGATIVE_KEYWORDS = [

    # ------------------------------------------------------
    # English
    # ------------------------------------------------------

    "desktop",
    "tower",
    "mini tower",
    "micro tower",
    "sff",
    "small form factor",
    "workstation",
    "server",
    "rack",
    "rackmount",
    "all-in-one",
    "all in one",
    "aio",
    "slim",
    "omnidesk",
    "prodesk",
    "elitedesk",
    "mini pc",
    "prodesk",
    "elitedesk",
    "omnidesk",

    # ------------------------------------------------------
    # Japanese
    # ------------------------------------------------------

    "デスクトップ",
    "タワー",
    "ワークステーション",
    "サーバー",
    "ラック",
    "一体型",
    "省スペース",
    "据え置き",
]



# ==========================================================
# GAMING
# ==========================================================

"""
Gaming workflow contradiction rules.

These keywords typically indicate:

- low-power educational systems
- non-gaming lightweight environments
"""

GAMING_NEGATIVE_KEYWORDS = [

    "chromebook",
    "education",
    "student",
    "school",

]

# ==========================================================
# AI
# ==========================================================

"""
AI workflow contradiction rules.

These CPUs are typically unsuitable
for modern local AI workflows.
"""

AI_NEGATIVE_KEYWORDS = [

    "celeron",
    "pentium",
    "athlon silver",

]

# ==========================================================
# FUTURE
# ==========================================================

"""
Future direction:

SEMANTIC_CONTRADICTIONS = {

    "mobility": [...],
    "gaming": [...],
    "ai": [...],

}

This will evolve into:

semantic graph balancing
semantic contradiction engine
semantic universe purification
"""