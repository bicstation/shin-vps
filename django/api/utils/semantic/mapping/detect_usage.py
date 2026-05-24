# =========================================================
# SHIN CORE LINX
# semantic/mapping/detect_usage.py
# =========================================================


# =========================================================
# USAGE ATTRIBUTE DETECTION
# =========================================================

def detect_usage(
    workflow_tags,
):

    slugs = set()

    # =====================================================
    # AI
    # =====================================================

    if (

        "ai_workflow" in workflow_tags
        or "local_ai" in workflow_tags
        or "local_llm" in workflow_tags

    ):

        slugs.add(
            "usage-ai"
        )

    # =====================================================
    # GAMING
    # =====================================================

    if (

        "gaming_ready" in workflow_tags
        or "high_end_gaming" in workflow_tags
        or "aaa_gaming" in workflow_tags

    ):

        slugs.add(
            "usage-gaming"
        )

    # =====================================================
    # CREATOR
    # =====================================================

    if (

        "creator_workflow" in workflow_tags
        or "creator_workstation" in workflow_tags

    ):

        slugs.add(
            "usage-creator"
        )

    # =====================================================
    # BUSINESS
    # =====================================================

    if (

        "office_work" in workflow_tags
        or "business_mobile" in workflow_tags

    ):

        slugs.add(
            "usage-business"
        )

    # =====================================================
    # STUDENT
    # =====================================================

    if (

        "student_mobile" in workflow_tags
        or "basic_computing" in workflow_tags

    ):

        slugs.add(
            "usage-student"
        )

    # =====================================================
    # MOBILE
    # =====================================================

    if "mobile_ai_pc" in workflow_tags:

        slugs.add(
            "usage-mobile"
        )

    # =====================================================
    # BASIC
    # =====================================================

    if not slugs:

        slugs.add(
            "usage-basic"
        )

    return list(slugs)