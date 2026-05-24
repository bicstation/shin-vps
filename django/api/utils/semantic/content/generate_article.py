# =========================================================
# SHIN CORE LINX
# semantic/content/generate_article.py
# semantic runtime aware article generator
# japanese semantic localization integrated
# =========================================================

from django.utils.html import strip_tags

from api.utils.semantic.localization.semantic_ja import (

    localize_workflows,

    localize_profiles,
)


# =========================================================
# HELPERS
# =========================================================

def safe_text(value):

    if not value:

        return ""

    return str(value).strip()


# =========================================================
# HELPERS
# =========================================================

def build_runtime_summary(

    localized_workflows,

    localized_profiles,
):

    parts = []

    # =====================================================
    # AI
    # =====================================================

    if "生成AI向け" in localized_workflows:

        parts.append(
            "生成AI"
        )

    # =====================================================
    # GAMING
    # =====================================================

    if (

        "AAAゲーム向け" in localized_workflows
        or "高性能ゲーミング" in localized_workflows

    ):

        parts.append(
            "高性能ゲーミング"
        )

    elif "ゲーム用途向け" in localized_workflows:

        parts.append(
            "ゲーム用途"
        )

    # =====================================================
    # CREATOR
    # =====================================================

    if "制作ワークステーション" in localized_workflows:

        parts.append(
            "動画編集"
        )

    elif "クリエイティブ制作向け" in localized_workflows:

        parts.append(
            "クリエイティブ用途"
        )

    # =====================================================
    # MOBILE AI
    # =====================================================

    if "モバイルAI PC" in localized_workflows:

        parts.append(
            "モバイルAI"
        )

    # =====================================================
    # FALLBACK
    # =====================================================

    if not parts:

        if "モバイル" in localized_profiles:

            parts.append(
                "日常用途"
            )

        else:

            parts.append(
                "マルチ用途"
            )

    return "・".join(parts)


# =========================================================
# HELPERS
# =========================================================

def build_spec_summary(
    specs,
):

    parts = []

    cpu = specs.get(
        "cpu_model",
        ""
    )

    gpu = specs.get(
        "gpu_model",
        ""
    )

    memory = specs.get(
        "memory_gb",
        0
    )

    storage = specs.get(
        "storage_gb",
        0
    )

    # =====================================================
    # CPU
    # =====================================================

    if cpu:

        parts.append(
            f"CPU: {cpu}"
        )

    # =====================================================
    # GPU
    # =====================================================

    if gpu:

        parts.append(
            f"GPU: {gpu}"
        )

    # =====================================================
    # MEMORY
    # =====================================================

    if memory:

        parts.append(
            f"メモリ: {memory}GB"
        )

    # =====================================================
    # STORAGE
    # =====================================================

    if storage:

        parts.append(
            f"ストレージ: {storage}GB"
        )

    return " / ".join(parts)


# =========================================================
# HELPERS
# =========================================================

def build_semantic_analysis(

    localized_workflows,
):

    # =====================================================
    # AI
    # =====================================================

    if "ローカルLLM対応" in localized_workflows:

        return (
            "このPCはローカルLLMや Stable Diffusion "
            "などの生成AI用途向けとして"
            "semantic runtime により解析されています。"
        )

    # =====================================================
    # GAMING
    # =====================================================

    if "AAAゲーム向け" in localized_workflows:

        return (
            "高性能GPUを搭載した AAAゲーム向け "
            "semantic workflow PC として解析されています。"
        )

    # =====================================================
    # CREATOR
    # =====================================================

    if "制作ワークステーション" in localized_workflows:

        return (
            "動画編集やクリエイティブ制作向けの "
            "creator workflow PC として分類されています。"
        )

    # =====================================================
    # MOBILE AI
    # =====================================================

    if "モバイルAI PC" in localized_workflows:

        return (
            "AI workflow とモバイル性能を両立した "
            "Copilot+ semantic PC として解析されています。"
        )

    # =====================================================
    # GENERAL
    # =====================================================

    return (
        "SHIN CORE LINX semantic runtime により"
        "マルチ用途向けPCとして解析されています。"
    )


# =========================================================
# HELPERS
# =========================================================

def build_score_section(

    ai_data,

    gaming_data,

    creator_data,
):

    ai_score = ai_data.get(
        "score_ai",
        0
    )

    gaming_score = gaming_data.get(
        "score_gaming",
        0
    )

    creator_score = creator_data.get(
        "score_creator",
        0
    )

    return f"""
<h3>Semantic Runtime Scores</h3>

<ul>
    <li>AI Score: {ai_score}</li>
    <li>Gaming Score: {gaming_score}</li>
    <li>Creator Score: {creator_score}</li>
</ul>
"""


# =========================================================
# HELPERS
# =========================================================

def build_workflow_section(
    localized_workflows,
):

    if not localized_workflows:

        return """
<h3>Workflow</h3>
<p>現在 semantic workflow を解析中です。</p>
"""

    workflow_html = "".join([

        f"<li>{tag}</li>"

        for tag in localized_workflows
    ])

    return f"""
<h3>Workflow</h3>

<ul>
    {workflow_html}
</ul>
"""


# =========================================================
# BUILD HTML
# =========================================================

def build_article_html(

    product,

    specs,

    ai_data,

    gaming_data,

    creator_data,

    localized_workflows,

    localized_profiles,
):

    runtime_summary = build_runtime_summary(

        localized_workflows,

        localized_profiles,
    )

    spec_summary = build_spec_summary(
        specs
    )

    semantic_analysis = build_semantic_analysis(
        localized_workflows
    )

    score_section = build_score_section(

        ai_data,

        gaming_data,

        creator_data,
    )

    workflow_section = build_workflow_section(
        localized_workflows
    )

    html = f"""
<h2>{product.name}</h2>

<p>
このモデルは、
SHIN CORE LINX semantic runtime により
自動解析されたPCです。
</p>

<h3>Semantic Runtime Overview</h3>

<p>
{runtime_summary}
</p>

<h3>スペック概要</h3>

<p>
{spec_summary}
</p>

<h3>Semantic Analysis</h3>

<p>
{semantic_analysis}
</p>

{score_section}

{workflow_section}

<h3>Semantic Runtime Profiles</h3>

<p>
{", ".join(localized_profiles)}
</p>

<p>
このコンテンツは、
SHIN CORE LINX semantic runtime により
自動生成されています。
</p>
"""

    return html.strip()


# =========================================================
# MAIN
# =========================================================

def generate_article_content(

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
    # INFERENCE
    # =====================================================

    inference = runtime_result.get(

        "inference",

        {}
    )

    ai_data = inference.get(
        "ai",
        {}
    )

    gaming_data = inference.get(
        "gaming",
        {}
    )

    creator_data = inference.get(
        "creator",
        {}
    )

    # =====================================================
    # WORKFLOW
    # =====================================================

    workflow_tags = runtime_result.get(

        "workflow_tags",

        []
    )

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

            "storage_gb":
                getattr(
                    product,
                    "storage_gb",
                    0
                ) or 0,
        }

    # =====================================================
    # DEBUG
    # =====================================================

    print(
        "\n"
        "================ ARTICLE RUNTIME ================"
    )

    print(
        workflow_tags
    )

    print(
        localized_workflows
    )

    # =====================================================
    # BUILD ARTICLE
    # =====================================================

    html = build_article_html(

        product=product,

        specs=specs,

        ai_data=ai_data,

        gaming_data=gaming_data,

        creator_data=creator_data,

        localized_workflows=localized_workflows,

        localized_profiles=localized_profiles,
    )

    # =====================================================
    # CLEANUP
    # =====================================================

    html = strip_tags(
        html
    ).strip()

    # =====================================================
    # RETURN
    # =====================================================

    return html