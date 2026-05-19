# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/runtime_builder.py

"""
SHIN CORE LINX
Semantic Runtime Builder

raw product
↓
semantic extraction
↓
semantic understanding
↓
workflow inference
↓
semantic graph
↓
adaptive runtime
↓
persistent semantic universe object
"""

from datetime import datetime

# ==========================================================
# SEMANTIC RUNTIME
# ==========================================================

from api.services.semantic.semantic_runtime import (
    build_full_semantic_runtime,
)

# ==========================================================
# SEMANTIC LABELS
# ==========================================================

from api.services.semantic.semantic_labels import (
    build_semantic_labels,
)

# ==========================================================
# WORKFLOW ENGINE
# ==========================================================

from api.services.semantic.workflow_inference import (

    infer_workflows,

    calculate_workflow_score,

    get_primary_workflow,

    build_workflow_tags,
)

# ==========================================================
# PRODUCT CLASSIFIER
# ==========================================================

from api.services.semantic.product_classifier import (
    build_product_runtime as build_product_identity_runtime,
)

# ==========================================================
# SEMANTIC GRAPH
# ==========================================================

from api.services.semantic.semantic_graph import (
    build_semantic_graph,
)

# ==========================================================
# TEXT SOURCES
# ==========================================================

TEXT_SOURCE_FIELDS = [

    "name",

    "description",

    "ai_summary",

    "ai_content",
]


# ==========================================================
# RUNTIME CONSTANTS
# ==========================================================

SEMANTIC_RUNTIME_VERSION = "v2"

SEMANTIC_AUTHORITY = "backend"

MIN_RUNTIME_SCORE = 5


# ==========================================================
# UTIL
# ==========================================================

def safe_text(value):

    if not value:
        return ""

    return str(value).strip()


def safe_int(value):

    try:
        return int(value)

    except:
        return 0


def unique_list(values):

    result = []

    for value in values:

        if not value:
            continue

        if value in result:
            continue

        result.append(value)

    return result


# ==========================================================
# SOURCE TEXT
# ==========================================================

def build_source_text(product):

    """
    unified semantic source text
    """

    parts = []

    for field in TEXT_SOURCE_FIELDS:

        try:

            value = getattr(
                product,
                field,
                None
            )

            value = safe_text(
                value
            )

            if value:

                parts.append(
                    value
                )

        except Exception:

            continue

    return "\n".join(parts)


# ==========================================================
# RUNTIME VALIDATION
# IMPORTANT:
# semantic contamination protection
# ==========================================================

def validate_runtime(runtime):

    if not runtime:
        return False

    semantic_score = safe_int(

        runtime.get(
            "semantic_score"
        )
    )

    # ------------------------------------------------------
    # Minimum semantic quality
    # ------------------------------------------------------

    if semantic_score < MIN_RUNTIME_SCORE:

        return False

    # ------------------------------------------------------
    # Product Type
    # ------------------------------------------------------

    product_type = runtime.get(
        "product_type"
    )

    if not product_type:

        return False

    # ------------------------------------------------------
    # Prevent impossible monitor contamination
    # ------------------------------------------------------

    if product_type in [

        "monitor",
        "immersive_monitor",
        "creator_monitor",
    ]:

        if runtime.get("memory_gb"):

            runtime["memory_gb"] = None

        if runtime.get("storage_gb"):

            runtime["storage_gb"] = None

    return True


# ==========================================================
# PRODUCT IDENTITY
# ==========================================================

def build_identity_runtime(

    runtime,
    source_text,
):

    identity_runtime = (
        build_product_identity_runtime(
            source_text
        )
    )

    runtime.update(
        identity_runtime
    )

    return runtime


# ==========================================================
# WORKFLOW RUNTIME
# ==========================================================

def build_workflow_runtime(runtime):

    workflows = infer_workflows(
        runtime
    )

    runtime["workflows"] = workflows

    runtime["workflow_score"] = (
        calculate_workflow_score(
            workflows
        )
    )

    runtime["workflow_tags"] = (
        build_workflow_tags(
            workflows
        )
    )

    primary_workflow = (
        get_primary_workflow(
            workflows
        )
    )

    runtime["primary_workflow"] = (

        primary_workflow.get(
            "workflow"
        )

        if primary_workflow
        else None
    )

    return runtime


# ==========================================================
# LABEL RUNTIME
# ==========================================================

def build_label_runtime(runtime):

    runtime["semantic_labels"] = (

        build_semantic_labels(
            runtime
        )
    )

    runtime["semantic_labels"] = unique_list(

        runtime.get(
            "semantic_labels",
            []
        )
    )

    return runtime


# ==========================================================
# META RUNTIME
# ==========================================================

def build_meta_runtime(runtime):

    runtime["semantic_version"] = (
        SEMANTIC_RUNTIME_VERSION
    )

    runtime["semantic_authority"] = (
        SEMANTIC_AUTHORITY
    )

    runtime["compiled_at"] = (
        datetime.utcnow().isoformat()
    )

    runtime["runtime_status"] = (
        "compiled"
    )

    return runtime


# ==========================================================
# GRAPH RUNTIME
# ==========================================================

def build_graph_runtime(

    product,

    runtime,

    related_products=None,
):

    """
    semantic exploration graph
    """

    if not related_products:

        runtime["semantic_graph"] = []

        return runtime

    try:

        edges = build_semantic_graph(

            source_product=product,

            candidate_products=related_products,

            limit=12,
        )

        runtime["semantic_graph"] = edges

    except Exception:

        runtime["semantic_graph"] = []

    return runtime


# ==========================================================
# BUILD RUNTIME
# ==========================================================

def build_product_runtime(

    product,

    related_products=None,
):

    """
    MAIN RUNTIME COMPILATION PIPELINE
    """

    # ======================================================
    # Source Text
    # ======================================================

    source_text = build_source_text(
        product
    )

    # ======================================================
    # Empty Protection
    # ======================================================

    if not source_text:

        return {

            "runtime_status":
                "empty",

            "semantic_authority":
                SEMANTIC_AUTHORITY,

            "semantic_version":
                SEMANTIC_RUNTIME_VERSION,
        }

    # ======================================================
    # Semantic Runtime
    # ======================================================

    runtime = build_full_semantic_runtime(
        source_text
    )

    # ======================================================
    # Product Identity
    # ======================================================

    runtime = build_identity_runtime(

        runtime,

        source_text,
    )

    # ======================================================
    # Workflow Runtime
    # ======================================================

    runtime = build_workflow_runtime(
        runtime
    )

    # ======================================================
    # Labels
    # ======================================================

    runtime = build_label_runtime(
        runtime
    )

    # ======================================================
    # Graph Runtime
    # ======================================================

    runtime = build_graph_runtime(

        product,

        runtime,

        related_products,
    )

    # ======================================================
    # Meta
    # ======================================================

    runtime = build_meta_runtime(
        runtime
    )

    # ======================================================
    # Validation
    # ======================================================

    valid = validate_runtime(
        runtime
    )

    runtime["runtime_valid"] = valid

    return runtime


# ==========================================================
# APPLY RUNTIME
# ==========================================================

def apply_runtime_to_product(

    product,

    related_products=None,
):

    """
    runtime
    ↓
    persistent semantic authority
    """

    runtime = build_product_runtime(

        product,

        related_products,
    )

    # ======================================================
    # Invalid Runtime
    # ======================================================

    if not runtime.get(
        "runtime_valid",
        False
    ):

        product.semantic_runtime = {

            "runtime_status":
                "invalid",

            "semantic_authority":
                SEMANTIC_AUTHORITY,

            "semantic_version":
                SEMANTIC_RUNTIME_VERSION,
        }

        return product

    # ======================================================
    # Core Specs
    # ======================================================

    product.cpu_model = runtime.get(
        "cpu_model"
    )

    product.gpu_model = runtime.get(
        "gpu_model"
    )

    product.memory_gb = runtime.get(
        "memory_gb"
    )

    product.storage_gb = runtime.get(
        "storage_gb"
    )

    # ======================================================
    # Display
    # ======================================================

    product.display_info = runtime.get(
        "display_type"
    )

    # ======================================================
    # Semantic Identity
    # ======================================================

    product.product_type = runtime.get(
        "product_type"
    )

    # ======================================================
    # Runtime Persistence
    # ======================================================

    product.semantic_runtime = runtime

    return product


# ==========================================================
# PARTIAL REBUILD CHECK
# ==========================================================

def requires_runtime_rebuild(product):

    """
    future incremental rebuild support
    """

    runtime = getattr(
        product,
        "semantic_runtime",
        {}
    ) or {}

    # ------------------------------------------------------
    # Missing Runtime
    # ------------------------------------------------------

    if not runtime:
        return True

    # ------------------------------------------------------
    # Old Version
    # ------------------------------------------------------

    runtime_version = runtime.get(
        "semantic_version"
    )

    if runtime_version != SEMANTIC_RUNTIME_VERSION:

        return True

    # ------------------------------------------------------
    # Invalid Runtime
    # ------------------------------------------------------

    if not runtime.get(
        "runtime_valid",
        False
    ):

        return True

    # ------------------------------------------------------
    # Missing Graph
    # ------------------------------------------------------

    if "semantic_graph" not in runtime:

        return True

    return False


# ==========================================================
# DIRTY CHECK
# ==========================================================

def mark_runtime_dirty(

    product,

    reason="updated",
):

    """
    semantic dirty tracking
    """

    runtime = getattr(
        product,
        "semantic_runtime",
        {}
    ) or {}

    runtime["runtime_status"] = (
        "dirty"
    )

    runtime["dirty_reason"] = (
        reason
    )

    runtime["dirty_at"] = (
        datetime.utcnow().isoformat()
    )

    product.semantic_runtime = runtime

    return product


# ==========================================================
# RUNTIME SUMMARY
# ==========================================================

def build_runtime_summary(runtime):

    if not runtime:
        return {}

    return {

        "product_type":
            runtime.get(
                "product_type"
            ),

        "primary_workflow":
            runtime.get(
                "primary_workflow"
            ),

        "semantic_score":
            runtime.get(
                "semantic_score"
            ),

        "workflow_score":
            runtime.get(
                "workflow_score"
            ),

        "semantic_labels":
            runtime.get(
                "semantic_labels",
                []
            )[:3],

        "workflow_tags":
            runtime.get(
                "workflow_tags",
                []
            )[:3],

        "runtime_valid":
            runtime.get(
                "runtime_valid",
                False
            ),
    }