# =========================================================
# SHIN CORE LINX
# semantic/localization/semantic_ja.py
# semantic japanese localization layer
# =========================================================


# =========================================================
# WORKFLOW TAGS
# =========================================================

SEMANTIC_WORKFLOW_JA = {

    # =====================================================
    # AI
    # =====================================================

    "ai_workflow":
        "生成AI向け",

    "local_ai":
        "ローカルAI向け",

    "local_llm":
        "ローカルLLM対応",

    "stable_diffusion":
        "画像生成AI向け",

    "ai_workstation":
        "AIワークステーション",

    "ai_capable":
        "AI活用向け",

    # =====================================================
    # GAMING
    # =====================================================

    "gaming_ready":
        "ゲーム用途向け",

    "high_end_gaming":
        "高性能ゲーミング",

    "enthusiast_gaming":
        "ハイエンドゲーミング",

    "competitive_gaming":
        "競技ゲーム向け",

    "high_refresh_gaming":
        "高リフレッシュレート対応",

    "aaa_gaming":
        "AAAゲーム向け",

    # =====================================================
    # CREATOR
    # =====================================================

    "creator_workflow":
        "クリエイティブ制作向け",

    "creator_workstation":
        "制作ワークステーション",

    "video_editing":
        "動画編集向け",

    "photo_editing":
        "画像編集向け",

    "3d_rendering":
        "3D制作向け",

    "creator_capable":
        "制作用途対応",

    # =====================================================
    # HYBRID
    # =====================================================

    "ai_creator_hybrid":
        "AIクリエイター向け",

    "gaming_creator_hybrid":
        "ゲーム制作向け",

    "gaming_ai_hybrid":
        "AIゲーミング向け",

    # =====================================================
    # MOBILE AI
    # =====================================================

    "copilot_plus_pc":
        "Copilot+ PC",

    "mobile_ai_pc":
        "モバイルAI PC",

    # =====================================================
    # GENERAL
    # =====================================================

    "basic_computing":
        "日常用途向け",
}


# =========================================================
# RUNTIME PROFILES
# =========================================================

SEMANTIC_PROFILE_JA = {

    "ai":
        "AI",

    "gaming":
        "ゲーミング",

    "creator":
        "クリエイティブ",

    "mobile":
        "モバイル",
}


# =========================================================
# SEMANTIC LABELS
# =========================================================

SEMANTIC_LABEL_JA = {

    "AI Ready":
        "AI対応",

    "Gaming Ready":
        "ゲーム対応",

    "Creator Ready":
        "制作向け",
}


# =========================================================
# HELPERS
# =========================================================

def localize_workflow(
    workflow_tag,
):

    return SEMANTIC_WORKFLOW_JA.get(

        workflow_tag,

        workflow_tag
    )


# =========================================================
# HELPERS
# =========================================================

def localize_profile(
    profile,
):

    return SEMANTIC_PROFILE_JA.get(

        profile,

        profile
    )


# =========================================================
# HELPERS
# =========================================================

def localize_label(
    label,
):

    return SEMANTIC_LABEL_JA.get(

        label,

        label
    )


# =========================================================
# HELPERS
# =========================================================

def localize_workflows(
    workflow_tags,
):

    return [

        localize_workflow(
            tag
        )

        for tag in workflow_tags
    ]


# =========================================================
# HELPERS
# =========================================================

def localize_profiles(
    runtime_profiles,
):

    return [

        localize_profile(
            profile
        )

        for profile in runtime_profiles
    ]


# =========================================================
# HELPERS
# =========================================================

def localize_labels(
    semantic_labels,
):

    return [

        localize_label(
            label
        )

        for label in semantic_labels
    ]