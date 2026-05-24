# =========================================================
# SHIN CORE LINX
# semantic/inference/compile_workflows.py
# semantic workflow compiler
# =========================================================


# =========================================================
# HELPERS
# =========================================================

def has_label(

    data,

    label
):

    labels = data.get(
        "labels",
        []
    )

    return label in labels


# =========================================================
# HELPERS
# =========================================================

def normalize_score(value):

    if value is None:

        return 0

    try:

        return int(value)

    except Exception:

        return 0


# =========================================================
# MAIN
# =========================================================

def compile_workflow_tags(

    specs,
    ai_data,
    gaming_data,
    creator_data,
):

    workflow_tags = []


    # =====================================================
    # NORMALIZED SCORES
    # =====================================================

    ai_score = normalize_score(

        ai_data.get(
            "score_ai"
        )
    )

    gaming_score = normalize_score(

        gaming_data.get(
            "score_gaming"
        )
    )

    creator_score = normalize_score(

        creator_data.get(
            "score_creator"
        )
    )


    # =====================================================
    # DEBUG
    # =====================================================

    print(
        "\n"
        "================ WORKFLOW SCORES ================"
    )

    print(
        f"AI: {ai_score}"
    )

    print(
        f"GAMING: {gaming_score}"
    )

    print(
        f"CREATOR: {creator_score}"
    )


    # =====================================================
    # AI WORKFLOW
    # =====================================================

    if ai_score >= 80:

        workflow_tags.extend([

            "ai_workflow",

            "local_llm",

            "stable_diffusion",

            "ai_workstation",
        ])


    elif ai_score >= 60:

        workflow_tags.extend([

            "ai_workflow",

            "local_ai",
        ])


    elif ai_score >= 40:

        workflow_tags.extend([

            "ai_capable",
        ])


    # =====================================================
    # GAMING WORKFLOW
    # =====================================================

    if gaming_score >= 85:

        workflow_tags.extend([

            "enthusiast_gaming",

            "high_refresh_gaming",

            "aaa_gaming",
        ])


    elif gaming_score >= 65:

        workflow_tags.extend([

            "high_end_gaming",

            "competitive_gaming",
        ])


    elif gaming_score >= 45:

        workflow_tags.extend([

            "gaming_ready",
        ])


    # =====================================================
    # CREATOR WORKFLOW
    # =====================================================

    if creator_score >= 80:

        workflow_tags.extend([

            "creator_workstation",

            "video_editing",

            "3d_rendering",
        ])


    elif creator_score >= 60:

        workflow_tags.extend([

            "creator_workflow",

            "photo_editing",
        ])


    elif creator_score >= 40:

        workflow_tags.extend([

            "creator_capable",
        ])


    # =====================================================
    # HYBRID WORKFLOW
    # =====================================================

    if (

        ai_score >= 60
        and creator_score >= 60

    ):

        workflow_tags.extend([

            "ai_creator_hybrid",
        ])


    if (

        gaming_score >= 60
        and creator_score >= 60

    ):

        workflow_tags.extend([

            "gaming_creator_hybrid",
        ])


    if (

        ai_score >= 60
        and gaming_score >= 60

    ):

        workflow_tags.extend([

            "gaming_ai_hybrid",
        ])


    # =====================================================
    # MOBILE AI PC
    # =====================================================

    has_npu = specs.get(
        "has_npu",
        False
    )

    memory_gb = normalize_score(

        specs.get(
            "memory_gb"
        )
    )

    cpu_model = (
        specs.get(
            "cpu_model",
            ""
        ) or ""
    ).lower()

    # =====================================================
    # NPU detection fallback
    # =====================================================

    if (

        "core ultra" in cpu_model
        or "snapdragon x" in cpu_model
        or "ryzen ai" in cpu_model

    ):

        has_npu = True


    # =====================================================
    # MOBILE AI TAGS
    # =====================================================

    if (

        has_npu
        and memory_gb >= 16

    ):

        workflow_tags.extend([

            "copilot_plus_pc",

            "mobile_ai_pc",
        ])


    # =====================================================
    # LOW-END SAFETY
    # =====================================================

    if (

        ai_score == 0
        and gaming_score == 0
        and creator_score == 0

    ):

        workflow_tags.extend([

            "basic_computing",
        ])


    # =====================================================
    # DEDUPLICATE
    # =====================================================

    workflow_tags = list(

        set(workflow_tags)
    )

    workflow_tags.sort()


    # =====================================================
    # DEBUG
    # =====================================================

    print(
        "\n"
        "================ WORKFLOW TAGS ================"
    )

    print(workflow_tags)


    # =====================================================
    # RETURN
    # =====================================================

    return workflow_tags