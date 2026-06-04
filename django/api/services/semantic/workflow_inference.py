# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/workflow_inference.py

"""
SHIN CORE LINX
Workflow Semantic Inference Engine

structured semantic runtime
↓
human intent inference
↓
workflow runtime generation
"""
from .contradiction_rules import (
    MOBILITY_NEGATIVE_KEYWORDS,
)


# ==========================================================
# WORKFLOW RULES
# ==========================================================

WORKFLOW_RULES = {

    # ======================================================
    # Gaming
    # ======================================================
    "gaming": {

        "gpu_keywords": [

            "RTX",
            "GTX",
            "RX",
        ],

        "refresh_rate_min":
            144,

        "memory_min":
            16,

        "score_bonus":
            30,

        "semantic_role":
            "high_performance",
    },

    # ======================================================
    # Creator
    # ======================================================
    "creator": {

        "gpu_keywords": [

            "RTX",
        ],

        "memory_min":
            32,

        "storage_min":
            1000,

        "score_bonus":
            40,

        "semantic_role":
            "creative_workflow",
    },

    # ======================================================
    # AI Workflow
    # ======================================================
    "ai": {

        "cpu_keywords": [

            "Core Ultra",
            "Ryzen AI",
            "Snapdragon X",
        ],

        "gpu_keywords": [

            "RTX 5090",
            "RTX 5080",
            "RTX 4090",
        ],

        "memory_min":
            32,

        "score_bonus":
            45,

        "semantic_role":
            "ai_generation",
    },

    # ======================================================
    # Business
    # ======================================================
    "business": {

        "memory_min":
            16,

        "score_bonus":
            20,

        "semantic_role":
            "productivity",
    },

    # ======================================================
    # Mobility
    # ======================================================
    "mobility": {

        "score_bonus":
            15,

        "semantic_role":
            "portable",
    },

    # ======================================================
    # Streaming
    # ======================================================
    "streaming": {

        "gpu_keywords": [

            "RTX",
        ],

        "memory_min":
            16,

        "score_bonus":
            25,

        "semantic_role":
            "live_streaming",
    },

    # ======================================================
    # Immersive
    # ======================================================
    "immersive": {

        "display_keywords": [

            "OLED",
            "QD-OLED",
        ],

        "refresh_rate_min":
            240,

        "score_bonus":
            30,

        "semantic_role":
            "visual_experience",
    },
}


# ==========================================================
# UTIL
# ==========================================================

def contains_keywords(value, keywords):

    if not value:
        return False

    value = str(value).lower()

    for keyword in keywords:

        if keyword.lower() in value:
            return True

    return False


def safe_int(value):

    try:
        return int(value)

    except:
        return 0


# ==========================================================
# NORMALIZE
# ==========================================================

def normalize_runtime(runtime):

    if not runtime:
        return {}

    return {
        
        "name":
            runtime.get(
                "name"
            ),

        "product_type":
            runtime.get(
                "product_type"
            ),

        "cpu_model":
            runtime.get(
                "cpu_model"
            ),

        "gpu_model":
            runtime.get(
                "gpu_model"
            ),

        "memory_gb":
            safe_int(
                runtime.get(
                    "memory_gb"
                )
            ),

        "storage_gb":
            safe_int(
                runtime.get(
                    "storage_gb"
                )
            ),

        "refresh_rate":
            safe_int(
                runtime.get(
                    "refresh_rate"
                )
            ),

        "display_type":
            runtime.get(
                "display_type"
            ),
    }


# ==========================================================
# BUILD RESULT
# ==========================================================

def build_workflow_result(

    workflow,
    confidence,
):

    rule = WORKFLOW_RULES.get(
        workflow,
        {}
    )

    return {

        "workflow":
            workflow,

        "confidence":
            confidence,

        "semantic_role":
            rule.get(
                "semantic_role"
            ),

        "score_bonus":
            rule.get(
                "score_bonus",
                0
            ),
    }


# ==========================================================
# GAMING
# ==========================================================

def infer_gaming(runtime):

    runtime = normalize_runtime(
        runtime
    )

    gpu_model = runtime["gpu_model"]

    refresh_rate = runtime[
        "refresh_rate"
    ]

    memory_gb = runtime[
        "memory_gb"
    ]

    rule = WORKFLOW_RULES["gaming"]

    score = 0

    # ------------------------------------------------------
    # GPU
    # ------------------------------------------------------

    if contains_keywords(

        gpu_model,

        rule["gpu_keywords"],
    ):

        score += 2

    # ------------------------------------------------------
    # High Refresh
    # ------------------------------------------------------

    if (
        refresh_rate >=
        rule["refresh_rate_min"]
    ):

        score += 1

    # ------------------------------------------------------
    # Memory
    # ------------------------------------------------------

    if (
        memory_gb >=
        rule["memory_min"]
    ):

        score += 1

    # ------------------------------------------------------
    # Result
    # ------------------------------------------------------

    if score >= 2:

        return build_workflow_result(
            "gaming",
            score,
        )

    return None


# ==========================================================
# CREATOR
# ==========================================================

def infer_creator(runtime):

    runtime = normalize_runtime(
        runtime
    )

    gpu_model = runtime["gpu_model"]

    memory_gb = runtime[
        "memory_gb"
    ]

    storage_gb = runtime[
        "storage_gb"
    ]

    rule = WORKFLOW_RULES["creator"]

    score = 0

    # ------------------------------------------------------
    # GPU
    # ------------------------------------------------------

    if contains_keywords(

        gpu_model,

        rule["gpu_keywords"],
    ):

        score += 1

    # ------------------------------------------------------
    # Memory
    # ------------------------------------------------------

    if (
        memory_gb >=
        rule["memory_min"]
    ):

        score += 1

    # ------------------------------------------------------
    # Storage
    # ------------------------------------------------------

    if (
        storage_gb >=
        rule["storage_min"]
    ):

        score += 1

    # ------------------------------------------------------
    # Result
    # ------------------------------------------------------

    if score >= 2:

        return build_workflow_result(
            "creator",
            score,
        )

    return None


# ==========================================================
# AI WORKFLOW
# ==========================================================

def infer_ai(runtime):

    runtime = normalize_runtime(
        runtime
    )

    cpu_model = runtime["cpu_model"]

    gpu_model = runtime["gpu_model"]

    memory_gb = runtime[
        "memory_gb"
    ]

    rule = WORKFLOW_RULES["ai"]

    score = 0

    # ------------------------------------------------------
    # AI CPU
    # ------------------------------------------------------

    if contains_keywords(

        cpu_model,

        rule["cpu_keywords"],
    ):

        score += 2

    # ------------------------------------------------------
    # High-end GPU
    # ------------------------------------------------------

    if contains_keywords(

        gpu_model,

        rule["gpu_keywords"],
    ):

        score += 2

    # ------------------------------------------------------
    # Memory
    # ------------------------------------------------------

    if (
        memory_gb >=
        rule["memory_min"]
    ):

        score += 1

    # ------------------------------------------------------
    # Result
    # ------------------------------------------------------

    if score >= 2:

        return build_workflow_result(
            "ai",
            score,
        )

    return None


# ==========================================================
# BUSINESS
# ==========================================================

def infer_business(runtime):

    runtime = normalize_runtime(
        runtime
    )

    memory_gb = runtime[
        "memory_gb"
    ]

    product_type = runtime[
        "product_type"
    ]

    rule = WORKFLOW_RULES["business"]

    score = 0

    # ------------------------------------------------------
    # PC only
    # ------------------------------------------------------

    if product_type in [

        "pc",

        "office_pc",

        "mobility_pc",
    ]:

        score += 1

    # ------------------------------------------------------
    # Memory
    # ------------------------------------------------------

    if (
        memory_gb >=
        rule["memory_min"]
    ):

        score += 1

    # ------------------------------------------------------
    # Result
    # ------------------------------------------------------

    if score >= 2:

        return build_workflow_result(
            "business",
            score,
        )

    return None



# ==========================================================
# MOBILITY
# ==========================================================

def infer_mobility(runtime):

    runtime = normalize_runtime(
        runtime
    )

    product_type = runtime[
        "product_type"
    ]

    # ------------------------------------------------------
    # PC only
    # ------------------------------------------------------

    if product_type not in [

        "pc",
        "mobility_pc",
    ]:

        return None

    # ------------------------------------------------------
    # semantic contradiction
    # ------------------------------------------------------
    
    normalized_text = " ".join([

        str(
            runtime["name"] or ""
        ),

        str(
            runtime["product_type"] or ""
        ),

    ]).lower()

    for keyword in MOBILITY_NEGATIVE_KEYWORDS:

        if keyword in normalized_text:

            return None

    # ------------------------------------------------------
    # mobility workflow
    # ------------------------------------------------------

    return build_workflow_result(
        "mobility",
        1,
    )

# ==========================================================
# STREAMING
# ==========================================================

def infer_streaming(runtime):

    runtime = normalize_runtime(
        runtime
    )

    gpu_model = runtime["gpu_model"]

    memory_gb = runtime[
        "memory_gb"
    ]

    rule = WORKFLOW_RULES["streaming"]

    score = 0

    # ------------------------------------------------------
    # RTX
    # ------------------------------------------------------

    if contains_keywords(

        gpu_model,

        rule["gpu_keywords"],
    ):

        score += 1

    # ------------------------------------------------------
    # Memory
    # ------------------------------------------------------

    if (
        memory_gb >=
        rule["memory_min"]
    ):

        score += 1

    # ------------------------------------------------------
    # Result
    # ------------------------------------------------------

    if score >= 2:

        return build_workflow_result(
            "streaming",
            score,
        )

    return None


# ==========================================================
# IMMERSIVE
# ==========================================================

def infer_immersive(runtime):

    runtime = normalize_runtime(
        runtime
    )

    display_type = runtime[
        "display_type"
    ]

    refresh_rate = runtime[
        "refresh_rate"
    ]

    rule = WORKFLOW_RULES["immersive"]

    score = 0

    # ------------------------------------------------------
    # OLED
    # ------------------------------------------------------

    if contains_keywords(

        display_type,

        rule["display_keywords"],
    ):

        score += 2

    # ------------------------------------------------------
    # High Refresh
    # ------------------------------------------------------

    if (
        refresh_rate >=
        rule["refresh_rate_min"]
    ):

        score += 1

    # ------------------------------------------------------
    # Result
    # ------------------------------------------------------

    if score >= 2:

        return build_workflow_result(
            "immersive",
            score,
        )

    return None


# ==========================================================
# MAIN
# ==========================================================

def infer_workflows(runtime):

    runtime = normalize_runtime(
        runtime
    )

    workflow_results = []

    infer_functions = [

        infer_gaming,

        infer_creator,

        infer_ai,

        infer_business,

        infer_mobility,

        infer_streaming,

        infer_immersive,
    ]

    for infer_function in infer_functions:

        try:

            result = infer_function(
                runtime
            )

            if result:

                workflow_results.append(
                    result
                )

        except Exception:

            continue

    return workflow_results




# ==========================================================
# WORKFLOW TAGS
# ==========================================================

def build_workflow_tags(workflows):

    """
    IMPORTANT:
    canonical traversal tokens

    UI labels must NOT be mixed into
    traversal/runtime semantics.
    """

    tags = []

    for workflow in workflows:

        workflow_name = workflow.get(
            "workflow"
        )

        # --------------------------------------------------
        # Gaming
        # --------------------------------------------------

        if workflow_name == "gaming":

            tags.append(
                "gaming"
            )

        # --------------------------------------------------
        # Creator
        # --------------------------------------------------

        elif workflow_name == "creator":

            tags.append(
                "creator"
            )

        # --------------------------------------------------
        # AI
        # --------------------------------------------------

        elif workflow_name == "ai":

            tags.append(
                "ai"
            )

        # --------------------------------------------------
        # Business
        # --------------------------------------------------

        elif workflow_name == "business":

            tags.append(
                "business"
            )

        # --------------------------------------------------
        # Mobility
        # --------------------------------------------------

        elif workflow_name == "mobility":

            tags.append(
                "mobility"
            )

        # --------------------------------------------------
        # Streaming
        # --------------------------------------------------

        elif workflow_name == "streaming":

            tags.append(
                "streaming"
            )

        # --------------------------------------------------
        # Immersive
        # --------------------------------------------------

        elif workflow_name == "immersive":

            tags.append(
                "immersive"
            )

    # ------------------------------------------------------
    # unique
    # ------------------------------------------------------

    unique_tags = []

    for tag in tags:

        if tag not in unique_tags:

            unique_tags.append(
                tag
            )

    return unique_tags[:6]

# ==========================================================
# WORKFLOW SCORE
# ==========================================================

def calculate_workflow_score(workflows):

    total = 0

    for workflow in workflows:

        total += workflow.get(
            "score_bonus",
            0
        )

    return total


# ==========================================================
# PRIMARY WORKFLOW
# ==========================================================

def get_primary_workflow(workflows):

    if not workflows:
        return None

    sorted_workflows = sorted(

        workflows,

        key=lambda x: x.get(
            "score_bonus",
            0
        ),

        reverse=True
    )

    return sorted_workflows[0]