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
    # HP
    # =====================================================

    {
        "maker": "hp",

        "match": [
            "elitebook",
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
        "maker": "hp",

        "match": [
            "probook",
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
        "maker": "hp",

        "match": [
            "omen",
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
        "maker": "hp",

        "match": [
            "victus",
        ],

        "product_type":
            "notebook",

        "target_segment":
            "gaming",

        "usage_tags": [
            "gaming",
        ],
    },

    # =====================================================
    # DELL
    # =====================================================

    {
        "maker": "dell",

        "match": [
            "dell pro",
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
        "maker": "dell",

        "match": [
            "latitude",
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
        "maker": "dell",

        "match": [
            "xps",
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
        "maker": "dell",

        "match": [
            "alienware",
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
    # FUJITSU
    # =====================================================

    {
        "maker": "fujitsu",

        "match": [
            "fmv",
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

    # =====================================================
    # DYNABOOK
    # =====================================================

    {
        "maker": "dynabook",

        "match": [
            "dynabook",
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