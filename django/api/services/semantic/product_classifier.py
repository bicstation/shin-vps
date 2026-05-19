# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/product_classifier.py

"""
SHIN CORE LINX
Semantic Product Identity Classifier

目的:
単なる product type ではなく

"この製品は何者か"

を semantic runtime として定義する
"""

import re


# ==========================================================
# CLEAN TEXT
# ==========================================================

def clean_text(text):

    if not text:
        return ""

    return str(text).strip().lower()


# ==========================================================
# BASE TYPE RULES
# ==========================================================

BASE_TYPE_RULES = {

    # ======================================================
    # PC
    # ======================================================
    "pc": [

        # English
        "laptop",
        "notebook",
        "desktop",
        "gaming pc",
        "gaming desktop",
        "workstation",

        # Japanese
        "ノートpc",
        "ノートパソコン",
        "デスクトップ",
        "ゲーミングpc",
        "ワークステーション",

        # CPU
        "core ultra",
        "core i",
        "ryzen",
        "snapdragon x",
    ],

    # ======================================================
    # Monitor
    # ======================================================
    "monitor": [

        # English
        "monitor",
        "display",

        # Japanese
        "モニター",
        "ディスプレイ",

        # Display Specs
        "oled",
        "qd-oled",
        "mini led",
        "240hz",
        "360hz",
        "4k monitor",
    ],

    # ======================================================
    # Software
    # ======================================================
    "software": [

        # English
        "office",
        "windows",
        "adobe",
        "antivirus",
        "backup software",
        "vpn",

        # Japanese
        "ダウンロード版",
        "ライセンス",
        "セキュリティソフト",
        "バックアップソフト",
    ],

    # ======================================================
    # Accessory
    # ======================================================
    "accessory": [

        # English
        "keyboard",
        "mouse",
        "webcam",
        "headset",
        "speaker",
        "microphone",
        "adapter",
        "cable",
        "cleaner",

        # Japanese
        "キーボード",
        "マウス",
        "ヘッドセット",
        "マイク",
        "スピーカー",
        "アダプター",
        "ケーブル",
        "クリーナー",
    ],
}


# ==========================================================
# PRIORITY
# IMPORTANT:
# contamination prevention
# ==========================================================

BASE_TYPE_PRIORITY = [

    "monitor",
    "software",
    "accessory",
    "pc",
]


# ==========================================================
# SEMANTIC TYPE RULES
# ==========================================================

SEMANTIC_TYPE_RULES = {

    # ======================================================
    # Gaming PC
    # ======================================================
    "gaming_pc": [

        "rtx",
        "geforce",

        "gaming",
        "fps",

        "240hz",
        "360hz",
    ],

    # ======================================================
    # Creator PC
    # ======================================================
    "creator_pc": [

        "creator",

        "video editing",
        "premiere",
        "davinci",

        "render",

        "32gb",
        "64gb",

        "4k editing",
    ],

    # ======================================================
    # AI Workstation
    # ======================================================
    "ai_workstation": [

        "ai",

        "cuda",

        "tensor",

        "rtx 5090",
        "rtx 5080",

        "llm",
        "stable diffusion",
    ],

    # ======================================================
    # Mobility PC
    # ======================================================
    "mobility_pc": [

        "thin",
        "lightweight",
        "mobile",

        "13-inch",
        "14-inch",

        "battery",

        "ultrabook",
    ],

    # ======================================================
    # Office PC
    # ======================================================
    "office_pc": [

        "office",

        "business",

        "excel",
        "zoom",

        "remote work",
    ],

    # ======================================================
    # Immersive Monitor
    # ======================================================
    "immersive_monitor": [

        "oled",
        "qd-oled",

        "240hz",
        "360hz",

        "hdr",
    ],

    # ======================================================
    # Creator Monitor
    # ======================================================
    "creator_monitor": [

        "4k",

        "color",
        "srgb",
        "adobe rgb",

        "ips",
    ],
}


# ==========================================================
# SCORE UTIL
# ==========================================================

def score_keywords(text, keywords):

    score = 0

    for keyword in keywords:

        if keyword.lower() in text:
            score += 1

    return score


# ==========================================================
# BASE TYPE
# ==========================================================

def classify_base_type(text):

    text = clean_text(text)

    if not text:
        return "pc"

    scores = {}

    for base_type in BASE_TYPE_PRIORITY:

        keywords = BASE_TYPE_RULES.get(
            base_type,
            []
        )

        scores[base_type] = score_keywords(
            text,
            keywords
        )

    best_type = "pc"
    best_score = 0

    for base_type in BASE_TYPE_PRIORITY:

        score = scores.get(
            base_type,
            0
        )

        if score > best_score:

            best_type = base_type
            best_score = score

    return best_type


# ==========================================================
# SEMANTIC TYPE
# ==========================================================

def classify_semantic_type(
    text,
    base_type,
):

    text = clean_text(text)

    semantic_scores = {}

    # ======================================================
    # PC Family
    # ======================================================

    if base_type == "pc":

        target_types = [

            "gaming_pc",

            "creator_pc",

            "ai_workstation",

            "mobility_pc",

            "office_pc",
        ]

    # ======================================================
    # Monitor Family
    # ======================================================

    elif base_type == "monitor":

        target_types = [

            "immersive_monitor",

            "creator_monitor",
        ]

    else:

        return base_type

    # ======================================================
    # Score
    # ======================================================

    for semantic_type in target_types:

        keywords = SEMANTIC_TYPE_RULES.get(
            semantic_type,
            []
        )

        semantic_scores[
            semantic_type
        ] = score_keywords(
            text,
            keywords
        )

    # ======================================================
    # Best Match
    # ======================================================

    best_type = base_type
    best_score = 0

    for semantic_type in target_types:

        score = semantic_scores.get(
            semantic_type,
            0
        )

        if score > best_score:

            best_type = semantic_type
            best_score = score

    return best_type


# ==========================================================
# RUNTIME PROFILE
# ==========================================================

def get_runtime_profile(
    base_type,
    semantic_type,
):

    profiles = {

        # ==================================================
        # Gaming
        # ==================================================
        "gaming_pc": {

            "primary_fields": [

                "gpu_model",

                "cpu_model",

                "memory_gb",

                "refresh_rate",
            ],

            "semantic_focus": [

                "fps",

                "competitive",

                "cooling",

                "immersive",
            ],
        },

        # ==================================================
        # Creator
        # ==================================================
        "creator_pc": {

            "primary_fields": [

                "cpu_model",

                "memory_gb",

                "storage_gb",

                "gpu_model",
            ],

            "semantic_focus": [

                "creator",

                "render",

                "workflow",

                "multitask",
            ],
        },

        # ==================================================
        # AI
        # ==================================================
        "ai_workstation": {

            "primary_fields": [

                "gpu_model",

                "memory_gb",

                "storage_gb",
            ],

            "semantic_focus": [

                "ai",

                "cuda",

                "llm",

                "generation",
            ],
        },

        # ==================================================
        # Mobility
        # ==================================================
        "mobility_pc": {

            "primary_fields": [

                "weight",

                "battery",

                "display_size",
            ],

            "semantic_focus": [

                "portable",

                "mobile",

                "cafe",

                "travel",
            ],
        },

        # ==================================================
        # Office
        # ==================================================
        "office_pc": {

            "primary_fields": [

                "cpu_model",

                "memory_gb",
            ],

            "semantic_focus": [

                "office",

                "business",

                "zoom",

                "daily",
            ],
        },

        # ==================================================
        # Immersive Monitor
        # ==================================================
        "immersive_monitor": {

            "primary_fields": [

                "display_type",

                "refresh_rate",
            ],

            "semantic_focus": [

                "visual_quality",

                "hdr",

                "immersive",

                "gaming",
            ],
        },

        # ==================================================
        # Creator Monitor
        # ==================================================
        "creator_monitor": {

            "primary_fields": [

                "display_type",

                "color_accuracy",
            ],

            "semantic_focus": [

                "creator",

                "color",

                "editing",

                "4k",
            ],
        },
    }

    # ======================================================
    # Fallback
    # ======================================================

    fallback_profiles = {

        "pc": {

            "primary_fields": [

                "cpu_model",

                "gpu_model",

                "memory_gb",
            ],

            "semantic_focus": [

                "workflow",
            ],
        },

        "monitor": {

            "primary_fields": [

                "display_type",
            ],

            "semantic_focus": [

                "display",
            ],
        },

        "software": {

            "primary_fields": [],

            "semantic_focus": [

                "productivity",
            ],
        },

        "accessory": {

            "primary_fields": [],

            "semantic_focus": [

                "support",
            ],
        },
    }

    return profiles.get(

        semantic_type,

        fallback_profiles.get(
            base_type,
            {}
        )
    )


# ==========================================================
# MAIN RUNTIME
# ==========================================================

def build_product_runtime(text):

    # ======================================================
    # Base Type
    # ======================================================

    base_type = classify_base_type(
        text
    )

    # ======================================================
    # Semantic Type
    # ======================================================

    semantic_type = classify_semantic_type(

        text,

        base_type,
    )

    # ======================================================
    # Runtime Profile
    # ======================================================

    runtime_profile = get_runtime_profile(

        base_type,

        semantic_type,
    )

    # ======================================================
    # Runtime
    # ======================================================

    return {

        # --------------------------------------------------
        # Base
        # --------------------------------------------------
        "base_type":
            base_type,

        # --------------------------------------------------
        # Semantic Identity
        # --------------------------------------------------
        "product_type":
            semantic_type,

        # --------------------------------------------------
        # Frontend Runtime
        # --------------------------------------------------
        "runtime_profile":
            runtime_profile,
    }