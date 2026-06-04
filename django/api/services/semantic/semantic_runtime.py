# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/semantic_runtime.py

"""
SHIN CORE LINX
Semantic Runtime Authority

raw product text
↓
semantic extraction
↓
semantic normalization
↓
product identity classification
↓
workflow inference
↓
human semantic labeling
↓
adaptive runtime generation
↓
frontend semantic authority
"""

# ==========================================================
# EXTRACTORS
# ==========================================================

from api.services.semantic.extractors import (
    build_semantic_runtime,
)

# ==========================================================
# NORMALIZERS
# ==========================================================

from api.services.semantic.normalizers import (
    normalize_semantic_runtime,
)

# ==========================================================
# PRODUCT CLASSIFIER
# ==========================================================

from api.services.semantic.product_classifier import (
    build_product_runtime,
)

# ==========================================================
# WORKFLOW ENGINE
# ==========================================================

from api.services.semantic.workflow_inference import (

    infer_workflows,

    build_workflow_tags,

    calculate_workflow_score,

    get_primary_workflow,
)

# ==========================================================
# HUMAN LABELS
# ==========================================================

from api.services.semantic.semantic_labels import (
    build_semantic_labels,
)


# ==========================================================
# UTIL
# ==========================================================

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
# SEMANTIC SCORE
# IMPORTANT:
# Human semantic value score
# ==========================================================

def calculate_semantic_score(runtime):

    """
    semantic value score

    NOT benchmark score
    NOT FPS score

    "semantic richness"
    """

    score = 0

    # ======================================================
    # GPU
    # ======================================================

    gpu_model = runtime.get(
        "gpu_model"
    )

    if gpu_model:

        score += 20

        gpu_upper = str(
            gpu_model
        ).upper()

        # --------------------------------------------------
        # High-end RTX
        # --------------------------------------------------

        if "5090" in gpu_upper:

            score += 25

        elif "5080" in gpu_upper:

            score += 20

        elif "4090" in gpu_upper:

            score += 18

        elif "5070" in gpu_upper:

            score += 15

        elif "4070" in gpu_upper:

            score += 12

        elif "RTX" in gpu_upper:

            score += 10

    # ======================================================
    # CPU
    # ======================================================

    cpu_model = runtime.get(
        "cpu_model"
    )

    if cpu_model:

        score += 10

        cpu_lower = str(
            cpu_model
        ).lower()

        # --------------------------------------------------
        # AI CPU
        # --------------------------------------------------

        if "core ultra" in cpu_lower:

            score += 10

        if "ryzen ai" in cpu_lower:

            score += 10

        if "snapdragon x" in cpu_lower:

            score += 10

    # ======================================================
    # Memory
    # ======================================================

    memory_gb = safe_int(

        runtime.get(
            "memory_gb"
        )
    )

    if memory_gb >= 64:

        score += 20

    elif memory_gb >= 32:

        score += 15

    elif memory_gb >= 16:

        score += 8

    # ======================================================
    # Storage
    # ======================================================

    storage_gb = safe_int(

        runtime.get(
            "storage_gb"
        )
    )

    if storage_gb >= 4000:

        score += 15

    elif storage_gb >= 2000:

        score += 10

    elif storage_gb >= 1000:

        score += 5

    # ======================================================
    # Display
    # ======================================================

    display_type = runtime.get(
        "display_type"
    )

    if display_type:

        score += 10

        if display_type == "QD-OLED":

            score += 20

        elif display_type == "OLED":

            score += 15

        elif display_type == "Mini LED":

            score += 10

    # ======================================================
    # Refresh Rate
    # ======================================================

    refresh_rate = safe_int(

        runtime.get(
            "refresh_rate"
        )
    )

    if refresh_rate >= 360:

        score += 15

    elif refresh_rate >= 240:

        score += 10

    elif refresh_rate >= 144:

        score += 5

    # ======================================================
    # Workflow Bonus
    # ======================================================

    workflow_score = safe_int(

        runtime.get(
            "workflow_score"
        )
    )

    score += workflow_score

    # ======================================================
    # Product Type Bonus
    # ======================================================

    product_type = runtime.get(
        "product_type"
    )

    if product_type in [

        "gaming_pc",
        "creator_pc",
        "ai_workstation",
    ]:

        score += 20

    elif product_type in [

        "immersive_monitor",
        "creator_monitor",
    ]:

        score += 10

    # ======================================================
    # Final Clamp
    # ======================================================

    if score < 0:
        score = 0

    if score > 100:
        score = 100

    return score


# ==========================================================
# ADAPTIVE RUNTIME
# IMPORTANT:
# Frontend semantic rendering authority
# ==========================================================

def build_adaptive_runtime(runtime):

    """
    frontend adaptive semantic payload
    """

    product_type = runtime.get(
        "product_type",
        "pc"
    )

    primary_workflow = runtime.get(
        "primary_workflow"
    )

    # ======================================================
    # AI Workstation
    # ======================================================

    if product_type == "ai_workstation":

        return {

            "focus":
                "ai",

            "primary_specs": [

                runtime.get(
                    "gpu_model"
                ),

                runtime.get(
                    "memory_gb"
                ),

                runtime.get(
                    "storage_gb"
                ),
            ],

            "ui_mode":
                "intelligence",

            "interaction_hint":
                "generation",
        }

    # ======================================================
    # Gaming
    # ======================================================

    if product_type == "gaming_pc":

        return {

            "focus":
                "gaming",

            "primary_specs": [

                runtime.get(
                    "gpu_model"
                ),

                runtime.get(
                    "refresh_rate"
                ),

                runtime.get(
                    "memory_gb"
                ),
            ],

            "ui_mode":
                "immersive",

            "interaction_hint":
                "competitive",
        }

    # ======================================================
    # Creator
    # ======================================================

    if product_type == "creator_pc":

        return {

            "focus":
                "creator",

            "primary_specs": [

                runtime.get(
                    "cpu_model"
                ),

                runtime.get(
                    "memory_gb"
                ),

                runtime.get(
                    "storage_gb"
                ),
            ],

            "ui_mode":
                "workflow",

            "interaction_hint":
                "editing",
        }

    # ======================================================
    # Monitor
    # ======================================================

    if product_type in [

        "immersive_monitor",
        "creator_monitor",
        "monitor",
    ]:

        return {

            "focus":
                "visual",

            "primary_specs": [

                runtime.get(
                    "display_type"
                ),

                runtime.get(
                    "refresh_rate"
                ),
            ],

            "ui_mode":
                "cinematic",

            "interaction_hint":
                "visual_quality",
        }

    # ======================================================
    # Mobility
    # ======================================================

    if product_type == "mobility_pc":

        return {

            "focus":
                "portable",

            "primary_specs": [

                runtime.get(
                    "cpu_model"
                ),

                runtime.get(
                    "memory_gb"
                ),
            ],

            "ui_mode":
                "lightweight",

            "interaction_hint":
                "mobility",
        }

    # ======================================================
    # Fallback
    # ======================================================

    return {

        "focus":
            primary_workflow or "general",

        "primary_specs": [

            runtime.get(
                "cpu_model"
            ),

            runtime.get(
                "gpu_model"
            ),
        ],

        "ui_mode":
            "general",

        "interaction_hint":
            "exploration",
    }


# ==========================================================
# RUNTIME VALIDATION
# ==========================================================

def validate_runtime(runtime):

    """
    semantic contamination protection
    """

    if not runtime:
        return {}

    # ======================================================
    # Remove impossible values
    # ======================================================

    memory_gb = safe_int(
        runtime.get("memory_gb")
    )

    if memory_gb > 512:

        runtime["memory_gb"] = None

    refresh_rate = safe_int(
        runtime.get("refresh_rate")
    )

    if refresh_rate > 1000:

        runtime["refresh_rate"] = None

    # ======================================================
    # Monitor cleanup
    # ======================================================

    product_type = runtime.get(
        "product_type"
    )

    if product_type in [

        "monitor",
        "immersive_monitor",
        "creator_monitor",
    ]:

        runtime["memory_gb"] = None
        runtime["storage_gb"] = None

    return runtime


# ==========================================================
# FRONTEND CONTRACT
# ==========================================================

def build_frontend_contract(runtime):

    """
    canonical frontend semantic contract
    """

    return {

        # --------------------------------------------------
        # Semantic Authority
        # --------------------------------------------------
        "semantic_authority":
            "backend",

        "semantic_version":
            "v2",

        # --------------------------------------------------
        # Identity
        # --------------------------------------------------
        "product_type":
            runtime.get(
                "product_type"
            ),

        "base_type":
            runtime.get(
                "base_type"
            ),

        # --------------------------------------------------
        # Semantic
        # --------------------------------------------------
        "semantic_score":
            runtime.get(
                "semantic_score"
            ),

        "workflow_score":
            runtime.get(
                "workflow_score"
            ),

        # --------------------------------------------------
        # Human Labels
        # --------------------------------------------------
        "semantic_labels":
            runtime.get(
                "semantic_labels",
                []
            ),

        "workflow_tags":
            runtime.get(
                "workflow_tags",
                []
            ),

        # --------------------------------------------------
        # Adaptive Runtime
        # --------------------------------------------------
        "adaptive_runtime":
            runtime.get(
                "adaptive_runtime",
                {}
            ),
    }


# ==========================================================
# MAIN
# ==========================================================

def build_full_semantic_runtime(text):

    """
    MAIN SEMANTIC AUTHORITY PIPELINE

    raw product text
    ↓
    extraction
    ↓
    normalization
    ↓
    product identity
    ↓
    workflow inference
    ↓
    semantic labels
    ↓
    adaptive runtime
    ↓
    frontend contract
    """

    # ======================================================
    # Extraction
    # ======================================================

    extracted_runtime = build_semantic_runtime(
        text
    )

    # ======================================================
    # Normalization
    # ======================================================

    normalized_runtime = (
        normalize_semantic_runtime(
            extracted_runtime
        )
    )

    # ======================================================
    # Product Runtime
    # ======================================================

    product_runtime = build_product_runtime(
        text
    )

    # ======================================================
    # Merge Runtime
    # ======================================================

    runtime = {

        **normalized_runtime,

        **product_runtime,
    }

    # ======================================================
    # Workflow Inference
    # ======================================================

    workflows = infer_workflows(
        runtime
    )

    runtime["workflows"] = workflows

    # ======================================================
    # Workflow Tags
    # ======================================================

    runtime["workflow_tags"] = (
        build_workflow_tags(
            workflows
        )
    )

    # ======================================================
    # Workflow Score
    # ======================================================

    runtime["workflow_score"] = (
        calculate_workflow_score(
            workflows
        )
    )

    # ======================================================
    # Primary Workflow
    # ======================================================

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

    # ======================================================
    # Semantic Labels
    # ======================================================

    runtime["semantic_labels"] = (
        build_semantic_labels(
            runtime
        )
    )

    # ======================================================
    # Semantic Score
    # ======================================================

    runtime["semantic_score"] = (
        calculate_semantic_score(
            runtime
        )
    )

    # ======================================================
    # Adaptive Runtime
    # ======================================================

    runtime["adaptive_runtime"] = (
        build_adaptive_runtime(
            runtime
        )
    )

    # ======================================================
    # Validation
    # ======================================================

    runtime = validate_runtime(
        runtime
    )

    # ======================================================
    # Frontend Contract
    # ======================================================

    runtime["frontend_contract"] = (
        build_frontend_contract(
            runtime
        )
    )

    # ======================================================
    # Semantic Metadata
    # ======================================================

    runtime["semantic_authority"] = (
        "backend"
    )

    runtime["semantic_version"] = (
        "v2"
    )

    return runtime