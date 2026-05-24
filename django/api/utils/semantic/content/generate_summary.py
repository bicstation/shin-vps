# =========================================================
# SHIN CORE LINX
# semantic/content/generate_summary.py
# semantic runtime aware summary generator
# japanese semantic localization integrated
# =========================================================

from api.utils.semantic.localization.semantic_ja import (

    localize_workflows,

    localize_profiles,
)


# =========================================================
# HELPERS
# =========================================================

def join_features(
    features,
):

    return "・".join(features)


# =========================================================
# HELPERS
# =========================================================

def build_runtime_sentence(

    localized_workflows,

    localized_profiles,
):

    parts = []

    # =====================================================
    # AI
    # =====================================================

    if "生成AI向け" in localized_workflows:

        parts.append(
            "生成AI用途"
        )

    elif "AI活用向け" in localized_workflows:

        parts.append(
            "AI活用"
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

    return join_features(parts)


# =========================================================
# HELPERS
# =========================================================

def build_spec_sentence(
    specs,
):

    parts = []

    cpu_model = specs.get(
        "cpu_model",
        ""
    )

    gpu_model = specs.get(
        "gpu_model",
        ""
    )

    memory_gb = specs.get(
        "memory_gb",
        0
    )

    # =====================================================
    # CPU
    # =====================================================

    if cpu_model:

        parts.append(cpu_model)

    # =====================================================
    # GPU
    # =====================================================

    if gpu_model:

        parts.append(gpu_model)

    # =====================================================
    # MEMORY
    # =====================================================

    if memory_gb:

        parts.append(
            f"{memory_gb}GBメモリ"
        )

    return join_features(parts)


# =========================================================
# HELPERS
# =========================================================

def build_semantic_sentence(

    localized_workflows,
):

    # =====================================================
    # AI
    # =====================================================

    if "ローカルLLM対応" in localized_workflows:

        return (
            "ローカルLLMや生成AI用途にも"
            "適した semantic runtime PCです。"
        )

    # =====================================================
    # CREATOR
    # =====================================================

    if "制作ワークステーション" in localized_workflows:

        return (
            "動画編集やクリエイティブ用途向けに"
            "最適化された semantic workflow を"
            "搭載しています。"
        )

    # =====================================================
    # GAMING
    # =====================================================

    if "AAAゲーム向け" in localized_workflows:

        return (
            "AAAゲームや高負荷ゲーミング向けとして"
            "解析された high-end gaming PCです。"
        )

    # =====================================================
    # MOBILE AI
    # =====================================================

    if "モバイルAI PC" in localized_workflows:

        return (
            "AI workflow とモバイル性能を両立した"
            "次世代 Copilot+ semantic PCです。"
        )

    # =====================================================
    # GENERAL
    # =====================================================

    return (
        "SHIN CORE LINX semantic runtime により"
        "解析されたマルチ用途向けPCです。"
    )


# =========================================================
# MAIN
# =========================================================

def generate_summary(

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

    specs = runtime_result.get(

        "specs",

        {}
    )

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

    if not specs:

        specs = {

            "cpu_model":
                product.cpu_model or "",

            "gpu_model":
                product.gpu_model or "",

            "memory_gb":
                product.memory_gb or 0,
        }

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
    # DEBUG
    # =====================================================

    print(
        "\n"
        "================ SUMMARY RUNTIME ================"
    )

    print(
        workflow_tags
    )

    print(
        localized_workflows
    )

    # =====================================================
    # BUILD
    # =====================================================

    runtime_sentence = (
        build_runtime_sentence(

            localized_workflows,

            localized_profiles,
        )
    )

    spec_sentence = (
        build_spec_sentence(
            specs
        )
    )

    semantic_sentence = (
        build_semantic_sentence(
            localized_workflows
        )
    )

    # =====================================================
    # FINAL SUMMARY
    # =====================================================

    summary_parts = [

        runtime_sentence,
    ]

    if spec_sentence:

        summary_parts.append(
            spec_sentence
        )

    summary_parts.append(
        semantic_sentence
    )

    summary = "。".join(summary_parts)

    # =====================================================
    # CLEANUP
    # =====================================================

    summary = summary.replace(
        "。。",
        "。"
    )

    summary = summary.strip()

    # =====================================================
    # RETURN
    # =====================================================

    return summary