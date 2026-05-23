# =========================================================
# SHIN CORE LINX
# semantic/content/generate_seo.py
# =========================================================


# =========================================================
# HELPERS
# =========================================================

def safe_join(parts):

    return " ".join([

        str(part).strip()

        for part in parts

        if part
    ])


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
# TITLE
# =========================================================

def generate_seo_title(

    product,
    workflow_tags,
):

    workflow_label = ""

    if "ai_workflow" in workflow_tags:

        workflow_label = "AI対応"

    elif "creator_workstation" in workflow_tags:

        workflow_label = "クリエイター向け"

    elif "high_end_gaming" in workflow_tags:

        workflow_label = "ゲーミング"

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
    workflow_tags,
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

    workflows = ", ".join(
        workflow_tags[:5]
    )

    description = safe_join([

        product.name,

        "を semantic runtime により解析。",

        f"CPU: {cpu}",

        f"GPU: {gpu}",

        f"メモリ: {memory}GB",

        f"workflow: {workflows}",
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
    workflow_tags,
):

    keywords = [

        product.name,

        "ノートPC",

        "デスクトップPC",

        "AI PC",

        "ゲーミングPC",

        "クリエイターPC",
    ]

    keywords.extend(
        workflow_tags
    )

    keywords = list(
        set(keywords)
    )

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
    specs,
    workflow_tags,
):

    # =====================================================
    # title
    # =====================================================

    seo_title = generate_seo_title(

        product,
        workflow_tags,
    )

    # =====================================================
    # description
    # =====================================================

    seo_description = (
        generate_seo_description(

            product,
            specs,
            workflow_tags,
        )
    )

    # =====================================================
    # keywords
    # =====================================================

    seo_keywords = (
        generate_seo_keywords(

            product,
            workflow_tags,
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