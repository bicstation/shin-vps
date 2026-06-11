# =========================================================
# FILE:
# api/services/feed/semantic/rules/semantic_rules.py
# =========================================================

SEMANTIC_RULES = [

    # =====================================================
    # ASUS
    # =====================================================

    {
        "maker": "asus",

        "match": [
            "vivobook",
        ],

        "product_type":
            "notebook",

        "target_segment":
            "general",

        "usage_tags": [
            "office",
            "home",
        ],
    },

    {
        "maker": "asus",

        "match": [
            "zenbook",
        ],

        "product_type":
            "notebook",

        "target_segment":
            "premium",

        "usage_tags": [
            "creator",
            "mobile",
        ],
    },

    {
        "maker": "asus",

        "match": [
            "expertbook",
        ],

        "product_type":
            "notebook",

        "target_segment":
            "business",

        "usage_tags": [
            "office",
            "business",
        ],
    },

    {
        "maker": "asus",

        "match": [
            "tuf gaming",
            "tuf",
        ],

        "product_type":
            "notebook",

        "target_segment":
            "gaming",

        "usage_tags": [
            "gaming",
        ],
    },

    {
        "maker": "asus",

        "match": [
            "rog",
        ],

        "product_type":
            "notebook",

        "target_segment":
            "gaming",

        "usage_tags": [
            "gaming",
            "enthusiast",
        ],
    },

    # =====================================================
    # GENERIC AI PC
    # =====================================================

    {
        "maker": "*",

        "match": [
            "copilot+",
            "copilot pc",
            "copilot+ pc",
        ],

        "is_ai_pc":
            True,

        "usage_tags": [
            "ai",
        ],
    },

]