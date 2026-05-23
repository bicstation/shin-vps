# =========================================================
# SHIN CORE LINX
# semantic/content/generate_summary.py
# =========================================================


# =========================================================
# HELPERS
# =========================================================

def safe_text(value):

    if not value:
        return ""

    return str(value).strip()


def build_spec_summary(specs):

    summary_parts = []

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

    if cpu:

        summary_parts.append(
            f"CPU: {cpu}"
        )

    if gpu:

        summary_parts.append(
            f"GPU: {gpu}"
        )

    if memory:

        summary_parts.append(
            f"メモリ {memory}GB"
        )

    if storage:

        summary_parts.append(
            f"SSD {storage}GB"
        )

    return " / ".join(
        summary_parts
    )


def build_workflow_summary(
    workflow_tags
):

    if not workflow_tags:

        return ""

    return "対応workflow: " + ", ".join(

        workflow_tags[:5]
    )


# =========================================================
# AI SUMMARY
# =========================================================

def build_ai_summary(
    ai_data
):

    score = ai_data.get(
        "score_ai",
        0
    )

    if score >= 80:

        return (
            "ローカルLLMや"
            "Stable Diffusion用途にも"
            "対応可能な高性能AI PCです。"
        )

    if score >= 60:

        return (
            "生成AIやAI支援用途に"
            "適した構成です。"
        )

    if score >= 40:

        return (
            "一般的なAI活用に"
            "対応できる性能を備えています。"
        )

    return (
        "一般用途向け構成です。"
    )


# =========================================================
# GAMING SUMMARY
# =========================================================

def build_gaming_summary(
    gaming_data
):

    score = gaming_data.get(
        "score_gaming",
        0
    )

    if score >= 85:

        return (
            "AAAゲームや"
            "高リフレッシュレート環境にも"
            "対応可能です。"
        )

    if score >= 65:

        return (
            "快適なゲーミング用途に"
            "対応できる性能です。"
        )

    if score >= 45:

        return (
            "軽〜中程度のゲーム用途にも"
            "対応できます。"
        )

    return ""


# =========================================================
# CREATOR SUMMARY
# =========================================================

def build_creator_summary(
    creator_data
):

    score = creator_data.get(
        "score_creator",
        0
    )

    if score >= 80:

        return (
            "動画編集や3D制作にも"
            "対応可能な"
            "クリエイター向け構成です。"
        )

    if score >= 60:

        return (
            "画像編集や動画編集向けとして"
            "バランスの良い性能です。"
        )

    if score >= 40:

        return (
            "一般的なクリエイティブ用途に"
            "対応できます。"
        )

    return ""


# =========================================================
# MAIN
# =========================================================

def generate_summary(

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

    summary_parts = []

    # =====================================================
    # specs
    # =====================================================

    spec_summary = build_spec_summary(
        specs
    )

    if spec_summary:

        summary_parts.append(
            spec_summary
        )

    # =====================================================
    # AI
    # =====================================================

    ai_summary = build_ai_summary(
        ai_data
    )

    if ai_summary:

        summary_parts.append(
            ai_summary
        )

    # =====================================================
    # gaming
    # =====================================================

    gaming_summary = (
        build_gaming_summary(
            gaming_data
        )
    )

    if gaming_summary:

        summary_parts.append(
            gaming_summary
        )

    # =====================================================
    # creator
    # =====================================================

    creator_summary = (
        build_creator_summary(
            creator_data
        )
    )

    if creator_summary:

        summary_parts.append(
            creator_summary
        )

    # =====================================================
    # workflow
    # =====================================================

    workflow_summary = (
        build_workflow_summary(
            workflow_tags
        )
    )

    if workflow_summary:

        summary_parts.append(
            workflow_summary
        )

    # =====================================================
    # final
    # =====================================================

    final_summary = "\n".join(
        summary_parts
    )

    return safe_text(
        final_summary
    )