# =========================================================
# SHIN CORE LINX
# semantic/content/generate_seo.py
# semantic runtime aware SEO generator
# japanese semantic localization integrated
# =========================================================

from api.utils.semantic.localization.semantic_ja import (

    localize_workflows,

    localize_profiles,
)


# =========================================================
# HELPERS
# =========================================================

def safe_join(parts):

    return " ".join([

        str(part).strip()

        for part in parts

        if part
    ])


# =========================================================
# HELPERS
# =========================================================

def truncate_text(

    text,

    max_length=120
):

    if not text:

        return ""

    text = str(text).strip()

    if len(text) <= max_length:

        return text

    return text[:max_length].rstrip() + "..."


# =========================================================
# HELPERS
# =========================================================

def build_workflow_label(
    localized_workflows,
):

    # =====================================================
    # AI
    # =====================================================

    if "ローカルLLM対応" in localized_workflows:

        return "ローカルLLM対応"

    if "生成AI向け" in localized_workflows:

        return "生成AI対応"

    # =====================================================
    # CREATOR
    # =====================================================

    if "制作ワークステーション" in localized_workflows:

        return "クリエイター向け"

    # =====================================================
    # GAMING
    # =====================================================

    if "AAAゲーム向け" in localized_workflows:

        return "AAAゲーミング"

    if "高性能ゲーミング" in localized_workflows:

        return "ゲーミング"

    # =====================================================
    # MOBILE AI
    # =====================================================

    if "モバイルAI PC" in localized_workflows:

        return "Copilot+ PC"

    # =====================================================
    # GENERAL
    # =====================================================

    return "semantic runtime PC"


# =========================================================
# TITLE
# =========================================================

def generate_seo_title(

    product,

    localized_workflows,
):

    workflow_label = (
        build_workflow_label(
            localized_workflows
        )
    )

    title = safe_join([

        product.name,

        workflow_label,

        "SHIN CORE LINX",
    ])

    return truncate_text(

        title,

        70
    )


# =========================================================
# DESCRIPTION
# =========================================================

def generate_seo_description(

    product,

    specs,

    localized_workflows,

    localized_profiles,
):

    cpu = specs.get(
        "cpu_model"
    )

    gpu = specs.get(
        "gpu_model"
    )

    memory = specs.get(
        "memory_gb"
    )

    # =====================================================
    # WORKFLOW SUMMARY
    # =====================================================

    workflow_summary = []

    if "生成AI向け" in localized_workflows:

        workflow_summary.append(
            "生成AI"
        )

    if "ゲーム用途向け" in localized_workflows:

        workflow_summary.append(
            "ゲーム"
        )

    if "クリエイティブ制作向け" in localized_workflows:

        workflow_summary.append(
            "クリエイティブ"
        )

    if "モバイルAI PC" in localized_workflows:

        workflow_summary.append(
            "Copilot+"
        )

    # =====================================================
    # FALLBACK
    # =====================================================

    if not workflow_summary:

        workflow_summary = localized_profiles

    workflow_text = ", ".join(
        workflow_summary[:5]
    )

    # =====================================================
    # DESCRIPTION
    # =====================================================

    description = safe_join([

        product.name,

        "を SHIN CORE LINX semantic runtime により解析。",

        workflow_text,

        "向け semantic workflow を搭載。",

        f"CPU: {cpu}",

        f"GPU: {gpu}",

        f"メモリ: {memory}GB",
    ])

    return truncate_text(

        description,

        160
    )


# =========================================================
# KEYWORDS
# =========================================================

def generate_seo_keywords(

    product,

    localized_workflows,

    localized_profiles,
):

    keywords = [

        product.name,

        "AI PC",

        "ゲーミングPC",

        "クリエイターPC",

        "Copilot+ PC",

        "semantic runtime",
    ]

    # =====================================================
    # WORKFLOWS
    # =====================================================

    keywords.extend(
        localized_workflows
    )

    # =====================================================
    # PROFILES
    # =====================================================

    keywords.extend(
        localized_profiles
    )

    # =====================================================
    # DEDUPLICATE
    # =====================================================

    keywords = list(
        set(keywords)
    )

    keywords.sort()

    return ", ".join(
        keywords
    )


# =========================================================
# OG DATA
# =========================================================

def generate_og_data(

    product,

    seo_title,

    seo_description,
):

    return {

        "og_title":
            seo_title,

        "og_description":
            seo_description,

        "og_image":
            product.image_url,

        "twitter_card":
            "summary_large_image",
    }


# =========================================================
# MAIN
# =========================================================

def generate_seo_data(

    product,

    runtime_result=None,
):

    # =====================================================
    # FALLBACK
    # =====================================================

    runtime_result = (
        runtime_result
        or {}
    )

    # =====================================================
    # SPECS
    # =====================================================

    specs = runtime_result.get(

        "specs",

        {}
    )

    # =====================================================
    # WORKFLOW TAGS
    # =====================================================

    workflow_tags = runtime_result.get(

        "workflow_tags",

        []
    )

    # =====================================================
    # RUNTIME PROFILES
    # =====================================================

    runtime_profiles = runtime_result.get(

        "runtime_profiles",

        []
    )

    # =====================================================
    # FALLBACK FROM PRODUCT
    # =====================================================

    if not workflow_tags:

        workflow_tags = (
            product.workflow_tags
            or []
        )

    if not runtime_profiles:

        runtime_profiles = (
            product.runtime_profiles
            or []
        )

    # =====================================================
    # LOCALIZATION
    # =====================================================

    localized_workflows = (
        localize_workflows(
            workflow_tags
        )
    )

    localized_profiles = (
        localize_profiles(
            runtime_profiles
        )
    )

    # =====================================================
    # FALLBACK SPECS
    # =====================================================

    if not specs:

        specs = {

            "cpu_model":
                product.cpu_model or "",

            "gpu_model":
                product.gpu_model or "",

            "memory_gb":
                product.memory_gb or 0,
        }

    # =====================================================
    # DEBUG
    # =====================================================

    print(
        "\n"
        "================ SEO RUNTIME ================"
    )

    print(
        workflow_tags
    )

    print(
        localized_workflows
    )

    # =====================================================
    # TITLE
    # =====================================================

    seo_title = generate_seo_title(

        product,

        localized_workflows,
    )

    # =====================================================
    # DESCRIPTION
    # =====================================================

    seo_description = (
        generate_seo_description(

            product,

            specs,

            localized_workflows,

            localized_profiles,
        )
    )

    # =====================================================
    # KEYWORDS
    # =====================================================

    seo_keywords = (
        generate_seo_keywords(

            product,

            localized_workflows,

            localized_profiles,
        )
    )

    # =====================================================
    # OG
    # =====================================================

    og_data = generate_og_data(

        product,

        seo_title,

        seo_description,
    )

    # =====================================================
    # RETURN
    # =====================================================

    return {

        "seo_title":
            seo_title,

        "seo_description":
            seo_description,

        "seo_keywords":
            seo_keywords,

        "og":
            og_data,
    }