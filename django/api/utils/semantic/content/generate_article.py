# =========================================================
# SHIN CORE LINX
# semantic/content/generate_article.py
# =========================================================

from django.utils.html import strip_tags


# =========================================================
# HELPERS
# =========================================================

def safe_text(value):

    if not value:
        return ""

    return str(value).strip()


def build_summary(

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

    parts = []

    if cpu:

        parts.append(
            f"CPU: {cpu}"
        )

    if gpu:

        parts.append(
            f"GPU: {gpu}"
        )

    if memory:

        parts.append(
            f"メモリ: {memory}GB"
        )

    if workflow_tags:

        parts.append(

            "用途: "
            + ", ".join(
                workflow_tags[:3]
            )
        )

    return " / ".join(parts)


# =========================================================
# BUILD CONTENT
# =========================================================

def build_article_html(

    product,
    specs,
    ai_data,
    gaming_data,
    creator_data,
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

    storage = specs.get(
        "storage_gb"
    )

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

    html = f"""
<h2>{product.name}</h2>

<p>
このモデルは、
SHIN CORE LINX semantic runtime により
自動解析されたPCです。
</p>

<h3>スペック概要</h3>

<ul>
    <li>CPU: {cpu}</li>
    <li>GPU: {gpu}</li>
    <li>メモリ: {memory}GB</li>
    <li>ストレージ: {storage}GB</li>
</ul>

<h3>Semantic Runtime Analysis</h3>

<ul>
    <li>AI Score: {ai_score}</li>
    <li>Gaming Score: {gaming_score}</li>
    <li>Creator Score: {creator_score}</li>
</ul>

<h3>Workflow Tags</h3>

<p>
{", ".join(workflow_tags)}
</p>

<p>
この製品の詳細は、
以下のリンクからご確認いただけます。
</p>
"""

    return html.strip()


# =========================================================
# FAQ
# =========================================================

def build_faq(

    product,
    workflow_tags,
):

    faq = [

        {
            "question":
                "このPCはAI用途に向いていますか？",

            "answer":
                "workflow_tags に "
                "ai_workflow が含まれている場合、"
                "ローカルAIや生成AI用途に適しています。"
        },

        {
            "question":
                "ゲーム用途でも使えますか？",

            "answer":
                "gaming_ready や "
                "high_end_gaming が含まれている場合、"
                "ゲーム用途にも対応できます。"
        },
    ]

    return faq


# =========================================================
# MAIN
# =========================================================

def generate_article_content(

    product,
    runtime_result,
):

    specs = runtime_result.get(
        "specs",
        {}
    )

    ai_data = runtime_result.get(
        "ai_data",
        {}
    )

    gaming_data = runtime_result.get(
        "gaming_data",
        {}
    )

    creator_data = runtime_result.get(
        "creator_data",
        {}
    )

    workflow_tags = runtime_result.get(
        "workflow_tags",
        []
    )

    # =====================================================
    # title
    # =====================================================

    title = (
        f"{product.name} "
        f"| SHIN CORE LINX"
    )

    # =====================================================
    # summary
    # =====================================================

    summary = build_summary(

        product=product,

        specs=specs,

        workflow_tags=workflow_tags,
    )

    # =====================================================
    # html
    # =====================================================

    content = build_article_html(

        product=product,

        specs=specs,

        ai_data=ai_data,

        gaming_data=gaming_data,

        creator_data=creator_data,

        workflow_tags=workflow_tags,
    )

    # =====================================================
    # faq
    # =====================================================

    faq = build_faq(

        product=product,

        workflow_tags=workflow_tags,
    )

    # =====================================================
    # return
    # =====================================================

    return {

        "title": safe_text(
            title
        ),

        "summary": safe_text(
            summary
        ),

        "content": content,

        "faq": faq,
    }