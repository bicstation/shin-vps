# =========================================================
# SHIN CORE LINX
# semantic/runtime/compile_semantic_runtime.py
# compact operational observability edition
# =========================================================

from api.utils.semantic.runtime.runtime_log import (
    runtime_log,
)

from api.utils.semantic.extraction.extract_pc_specs import (
    extract_pc_specs,
)

from api.utils.semantic.inference.infer_ai import (
    infer_ai_capability,
)

from api.utils.semantic.inference.infer_gaming import (
    infer_gaming_capability,
)

from api.utils.semantic.inference.infer_creator import (
    infer_creator_capability,
)

from api.utils.semantic.inference.compile_workflows import (
    compile_workflow_tags,
)

from api.utils.semantic.content.generate_summary import (
    generate_summary,
)

from api.utils.semantic.content.generate_article import (
    generate_article_content,
)

from api.utils.semantic.content.generate_faq import (
    generate_faq,
)

from api.utils.semantic.content.generate_seo import (
    generate_seo_data,
)


# =========================================================
# HELPERS
# =========================================================

def load_existing_specs(
    product,
):

    return {

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

        "display_size":
            getattr(
                product,
                "display_size",
                0
            ) or 0,

        "refresh_rate":
            getattr(
                product,
                "refresh_rate",
                0
            ) or 0,

        "has_npu":
            getattr(
                product,
                "has_npu",
                False
            ) or False,

        "display_info":
            getattr(
                product,
                "display_info",
                ""
            ) or "",
    }


# =========================================================
# HELPERS
# =========================================================

def build_runtime_profiles(
    workflow_tags,
):

    runtime_profiles = []

    if (

        "ai_workflow" in workflow_tags
        or "local_ai" in workflow_tags
        or "local_llm" in workflow_tags

    ):

        runtime_profiles.append(
            "ai"
        )

    if (

        "gaming_ready" in workflow_tags
        or "high_end_gaming" in workflow_tags
        or "aaa_gaming" in workflow_tags

    ):

        runtime_profiles.append(
            "gaming"
        )

    if (

        "creator_workflow" in workflow_tags
        or "creator_workstation" in workflow_tags

    ):

        runtime_profiles.append(
            "creator"
        )

    if "mobile_ai_pc" in workflow_tags:

        runtime_profiles.append(
            "mobile"
        )

    if not runtime_profiles:

        runtime_profiles.append(
            "basic"
        )

    runtime_profiles = list(
        set(runtime_profiles)
    )

    runtime_profiles.sort()

    return runtime_profiles


# =========================================================
# HELPERS
# =========================================================

def build_semantic_labels(

    ai_data,

    gaming_data,

    creator_data,
):

    labels = []

    if ai_data.get(
        "score_ai",
        0
    ) >= 60:

        labels.append(
            "AI Ready"
        )

    if gaming_data.get(
        "score_gaming",
        0
    ) >= 60:

        labels.append(
            "Gaming Ready"
        )

    if creator_data.get(
        "score_creator",
        0
    ) >= 60:

        labels.append(
            "Creator Ready"
        )

    return labels


# =========================================================
# HELPERS
# =========================================================

def compact_specs_log(
    specs,
):

    return {

        "CPU":
            specs.get(
                "cpu_model"
            ) or "-",

        "GPU":
            specs.get(
                "gpu_model"
            ) or "-",

        "RAM":
            f"{specs.get('memory_gb', 0)}GB",
    }


# =========================================================
# HELPERS
# =========================================================

def compact_scores_log(

    ai_data,

    gaming_data,

    creator_data,
):

    return {

        "AI":
            ai_data.get(
                "score_ai",
                0
            ),

        "GAMING":
            gaming_data.get(
                "score_gaming",
                0
            ),

        "CREATOR":
            creator_data.get(
                "score_creator",
                0
            ),
    }


# =========================================================
# MAIN
# =========================================================

def compile_semantic_runtime(

    product,

    skip_extraction=False,

    trace_runtime=False,

    progress_label=None,
):

    # =====================================================
    # HEADER
    # =====================================================

    header = "SEMANTIC RUNTIME"

    if progress_label:

        header = (
            f"{progress_label}"
            " SEMANTIC RUNTIME"
        )

    runtime_log(

        trace_runtime,

        header,

        product.name,
    )

    # =====================================================
    # EXTRACTION
    # =====================================================

    if skip_extraction:

        specs = load_existing_specs(
            product
        )

    else:

        specs = extract_pc_specs(

            product,

            trace_runtime=trace_runtime,
        )

    # =====================================================
    # SPECS
    # =====================================================

    runtime_log(

        trace_runtime,

        "SPECS",

        compact_specs_log(
            specs
        ),
    )

    # =====================================================
    # INFERENCE
    # =====================================================

    ai_data = infer_ai_capability(
        specs
    )

    gaming_data = infer_gaming_capability(
        specs
    )

    creator_data = infer_creator_capability(
        specs
    )

    # =====================================================
    # SCORES
    # =====================================================

    runtime_log(

        trace_runtime,

        "SCORES",

        compact_scores_log(

            ai_data,

            gaming_data,

            creator_data,
        ),
    )

    # =====================================================
    # WORKFLOW
    # =====================================================

    workflow_tags = compile_workflow_tags(

        specs=specs,

        ai_data=ai_data,

        gaming_data=gaming_data,

        creator_data=creator_data,
    )

    runtime_profiles = build_runtime_profiles(
        workflow_tags
    )

    semantic_labels = build_semantic_labels(

        ai_data,

        gaming_data,

        creator_data,
    )

    runtime_log(

        trace_runtime,

        "WORKFLOW",

        workflow_tags,
    )

    # =====================================================
    # CONTENT
    # =====================================================

    runtime_payload = {

        "specs":
            specs,

        "workflow_tags":
            workflow_tags,

        "runtime_profiles":
            runtime_profiles,

        "inference": {

            "ai":
                ai_data,

            "gaming":
                gaming_data,

            "creator":
                creator_data,
        },
    }

    summary = generate_summary(

        product,

        runtime_result=runtime_payload,
    )

    article = generate_article_content(

        product,

        runtime_result=runtime_payload,
    )

    faq = generate_faq(
        workflow_tags
    )

    seo = generate_seo_data(

        product,

        runtime_result=runtime_payload,
    )

    # =====================================================
    # RESULT
    # =====================================================

    runtime_result = {

        "semantic_schema_version":
            "v2",

        "semantic_runtime_compiled":
            True,

        "specs":
            specs,

        "inference": {

            "ai":
                ai_data,

            "gaming":
                gaming_data,

            "creator":
                creator_data,
        },

        "workflow_tags":
            workflow_tags,

        "runtime_profiles":
            runtime_profiles,

        "semantic_labels":
            semantic_labels,

        "summary":
            summary,

        "article":
            article,

        "faq":
            faq,

        "seo":
            seo,
    }

    # =====================================================
    # PERSISTENCE
    # =====================================================

    product.cpu_model = specs.get(
        "cpu_model",
        ""
    )

    product.gpu_model = specs.get(
        "gpu_model",
        ""
    )

    product.memory_gb = specs.get(
        "memory_gb",
        0
    )

    product.workflow_tags = (
        workflow_tags
    )

    product.runtime_profiles = (
        runtime_profiles
    )

    product.semantic_labels = (
        semantic_labels
    )

    product.semantic_runtime = (
        runtime_result
    )

    product.semantic_runtime_compiled = True

    if hasattr(product, "summary"):

        product.summary = summary

    if hasattr(product, "article"):

        product.article = article

    if hasattr(product, "faq_data"):

        product.faq_data = faq

    if hasattr(product, "seo_title"):

        product.seo_title = seo.get(
            "seo_title",
            ""
        )

    if hasattr(product, "seo_description"):

        product.seo_description = seo.get(
            "seo_description",
            ""
        )

    if hasattr(product, "seo_keywords"):

        product.seo_keywords = seo.get(
            "seo_keywords",
            ""
        )

    product.save()

    # =====================================================
    # DONE
    # =====================================================

    done_label = "✅ persisted"

    if progress_label:

        done_label = (
            f"✅ {progress_label} persisted"
        )

    runtime_log(

        trace_runtime,

        done_label,

        product.name,
    )

    return runtime_result