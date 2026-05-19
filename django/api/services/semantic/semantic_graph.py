# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/semantic_graph.py

"""
SHIN CORE LINX
Semantic Exploration Graph Engine

product
↓
semantic identity
↓
workflow continuity
↓
exploration edges
↓
human intent navigation
"""

# ==========================================================
# UTIL
# ==========================================================

def safe_list(value):

    if not value:
        return []

    if isinstance(value, list):
        return value

    return [value]


def safe_int(value):

    try:
        return int(value)

    except:
        return 0


def normalize_workflows(runtime):

    workflows = runtime.get(
        "workflows",
        []
    )

    normalized = []

    for workflow in workflows:

        if isinstance(workflow, dict):

            workflow_name = workflow.get(
                "workflow"
            )

            if workflow_name:

                normalized.append(
                    workflow_name
                )

        elif isinstance(workflow, str):

            normalized.append(
                workflow
            )

    return normalized


def has_overlap(a, b):

    a = set(safe_list(a))
    b = set(safe_list(b))

    return len(a & b) > 0


# ==========================================================
# VALIDATION
# IMPORTANT:
# Prevent semantic contamination
# ==========================================================

EXCLUDED_PRODUCT_TYPES = [

    "accessory",
    "software",
]


MIN_SEMANTIC_SCORE = 10


def valid_runtime(runtime):

    if not runtime:
        return False

    product_type = runtime.get(
        "product_type"
    )

    if product_type in EXCLUDED_PRODUCT_TYPES:

        return False

    semantic_score = safe_int(

        runtime.get(
            "semantic_score"
        )
    )

    if semantic_score < MIN_SEMANTIC_SCORE:

        return False

    return True


# ==========================================================
# WORKFLOW EDGE
# ==========================================================

def calculate_workflow_edge_score(

    source_runtime,
    candidate_runtime,
):

    score = 0

    source_workflows = normalize_workflows(
        source_runtime
    )

    candidate_workflows = normalize_workflows(
        candidate_runtime
    )

    overlap = set(
        source_workflows
    ) & set(
        candidate_workflows
    )

    # ======================================================
    # Shared Workflow
    # ======================================================

    score += len(overlap) * 30

    # ======================================================
    # Workflow Evolution
    # ======================================================

    workflow_edges = {

        # --------------------------------------------------
        # Creator
        # --------------------------------------------------
        ("creator", "streaming"): 15,
        ("streaming", "creator"): 15,

        # --------------------------------------------------
        # Gaming → AI
        # --------------------------------------------------
        ("gaming", "ai"): 20,
        ("ai", "gaming"): 10,

        # --------------------------------------------------
        # Mobility → Business
        # --------------------------------------------------
        ("mobility", "business"): 10,
        ("business", "mobility"): 10,
    }

    for edge_pair, edge_score in (

        workflow_edges.items()

    ):

        source_workflow, target_workflow = (
            edge_pair
        )

        if (
            source_workflow in source_workflows
            and
            target_workflow in candidate_workflows
        ):

            score += edge_score

    return score


# ==========================================================
# GPU CONTINUITY
# ==========================================================

def calculate_gpu_edge_score(

    source_runtime,
    candidate_runtime,
):

    source_gpu = str(

        source_runtime.get(
            "gpu_model",
            ""
        )
    ).upper()

    candidate_gpu = str(

        candidate_runtime.get(
            "gpu_model",
            ""
        )
    ).upper()

    if not source_gpu or not candidate_gpu:
        return 0

    # ======================================================
    # RTX Continuity
    # ======================================================

    if (
        "RTX" in source_gpu
        and
        "RTX" in candidate_gpu
    ):

        score = 20

        # --------------------------------------------------
        # Same GPU Family
        # --------------------------------------------------

        source_series = source_gpu[-2:]
        candidate_series = candidate_gpu[-2:]

        if source_series == candidate_series:

            score += 10

        return score

    # ======================================================
    # GTX Continuity
    # ======================================================

    if (
        "GTX" in source_gpu
        and
        "GTX" in candidate_gpu
    ):

        return 15

    return 0


# ==========================================================
# PRODUCT TYPE CONTINUITY
# ==========================================================

def calculate_product_type_edge_score(

    source_runtime,
    candidate_runtime,
):

    source_type = source_runtime.get(
        "product_type"
    )

    candidate_type = candidate_runtime.get(
        "product_type"
    )

    if not source_type or not candidate_type:
        return 0

    # ======================================================
    # Same Runtime
    # ======================================================

    if source_type == candidate_type:

        return 20

    # ======================================================
    # Semantic Continuity
    # ======================================================

    continuity_rules = {

        # --------------------------------------------------
        # Gaming
        # --------------------------------------------------
        (
            "gaming_pc",
            "immersive_monitor"
        ): 30,

        # --------------------------------------------------
        # Creator
        # --------------------------------------------------
        (
            "creator_pc",
            "creator_monitor"
        ): 35,

        # --------------------------------------------------
        # AI
        # --------------------------------------------------
        (
            "gaming_pc",
            "ai_workstation"
        ): 20,

        # --------------------------------------------------
        # Mobility
        # --------------------------------------------------
        (
            "mobility_pc",
            "creator_monitor"
        ): 10,
    }

    edge_score = continuity_rules.get(

        (
            source_type,
            candidate_type,
        ),

        0
    )

    return edge_score


# ==========================================================
# CREATOR CONTINUITY
# ==========================================================

def calculate_creator_edge_score(

    source_runtime,
    candidate_runtime,
):

    source_workflows = normalize_workflows(
        source_runtime
    )

    candidate_workflows = normalize_workflows(
        candidate_runtime
    )

    if (
        "creator" in source_workflows
        and
        "creator" in candidate_workflows
    ):

        return 25

    return 0


# ==========================================================
# AI CONTINUITY
# ==========================================================

def calculate_ai_edge_score(

    source_runtime,
    candidate_runtime,
):

    source_workflows = normalize_workflows(
        source_runtime
    )

    candidate_workflows = normalize_workflows(
        candidate_runtime
    )

    if (
        "ai" in source_workflows
        and
        "ai" in candidate_workflows
    ):

        return 30

    return 0


# ==========================================================
# DISPLAY CONTINUITY
# ==========================================================

def calculate_display_edge_score(

    source_runtime,
    candidate_runtime,
):

    source_display = source_runtime.get(
        "display_type"
    )

    candidate_display = candidate_runtime.get(
        "display_type"
    )

    if (
        not source_display
        or
        not candidate_display
    ):

        return 0

    # ======================================================
    # Same Display
    # ======================================================

    if source_display == candidate_display:

        return 20

    # ======================================================
    # OLED Family
    # ======================================================

    oled_family = [

        "OLED",
        "QD-OLED",
    ]

    if (
        source_display in oled_family
        and
        candidate_display in oled_family
    ):

        return 15

    return 0


# ==========================================================
# MEMORY CONTINUITY
# ==========================================================

def calculate_memory_edge_score(

    source_runtime,
    candidate_runtime,
):

    source_memory = safe_int(

        source_runtime.get(
            "memory_gb"
        )
    )

    candidate_memory = safe_int(

        candidate_runtime.get(
            "memory_gb"
        )
    )

    if (
        source_memory <= 0
        or
        candidate_memory <= 0
    ):

        return 0

    # ======================================================
    # High Memory Runtime
    # ======================================================

    if (
        source_memory >= 32
        and
        candidate_memory >= 32
    ):

        return 15

    return 0


# ==========================================================
# SEMANTIC LABEL CONTINUITY
# ==========================================================

def calculate_label_edge_score(

    source_runtime,
    candidate_runtime,
):

    source_labels = safe_list(

        source_runtime.get(
            "semantic_labels",
            []
        )
    )

    candidate_labels = safe_list(

        candidate_runtime.get(
            "semantic_labels",
            []
        )
    )

    overlap = set(
        source_labels
    ) & set(
        candidate_labels
    )

    return len(overlap) * 5


# ==========================================================
# TOTAL EDGE SCORE
# ==========================================================

def calculate_semantic_edge_score(

    source_runtime,
    candidate_runtime,
):

    score = 0

    # ======================================================
    # Workflow
    # ======================================================

    score += calculate_workflow_edge_score(

        source_runtime,

        candidate_runtime,
    )

    # ======================================================
    # GPU
    # ======================================================

    score += calculate_gpu_edge_score(

        source_runtime,

        candidate_runtime,
    )

    # ======================================================
    # Product Type
    # ======================================================

    score += calculate_product_type_edge_score(

        source_runtime,

        candidate_runtime,
    )

    # ======================================================
    # Creator
    # ======================================================

    score += calculate_creator_edge_score(

        source_runtime,

        candidate_runtime,
    )

    # ======================================================
    # AI
    # ======================================================

    score += calculate_ai_edge_score(

        source_runtime,

        candidate_runtime,
    )

    # ======================================================
    # Display
    # ======================================================

    score += calculate_display_edge_score(

        source_runtime,

        candidate_runtime,
    )

    # ======================================================
    # Memory
    # ======================================================

    score += calculate_memory_edge_score(

        source_runtime,

        candidate_runtime,
    )

    # ======================================================
    # Semantic Labels
    # ======================================================

    score += calculate_label_edge_score(

        source_runtime,

        candidate_runtime,
    )

    return score


# ==========================================================
# EDGE TYPE
# ==========================================================

def determine_edge_type(

    source_runtime,
    candidate_runtime,
):

    source_workflows = normalize_workflows(
        source_runtime
    )

    candidate_workflows = normalize_workflows(
        candidate_runtime
    )

    source_type = source_runtime.get(
        "product_type"
    )

    candidate_type = candidate_runtime.get(
        "product_type"
    )

    # ======================================================
    # AI Continuity
    # ======================================================

    if (
        "ai" in source_workflows
        and
        "ai" in candidate_workflows
    ):

        return "ai_continuity"

    # ======================================================
    # Creator Continuity
    # ======================================================

    if (
        "creator" in source_workflows
        and
        "creator" in candidate_workflows
    ):

        return "creator_continuity"

    # ======================================================
    # Gaming Continuity
    # ======================================================

    if (
        "gaming" in source_workflows
        and
        "gaming" in candidate_workflows
    ):

        return "gaming_continuity"

    # ======================================================
    # Cross Runtime
    # ======================================================

    if source_type != candidate_type:

        return "workflow_evolution"

    # ======================================================
    # Fallback
    # ======================================================

    return "semantic_related"


# ==========================================================
# EDGE EXPLANATION
# ==========================================================

def build_edge_explanation(

    source_runtime,
    candidate_runtime,
):

    explanations = []

    source_workflows = normalize_workflows(
        source_runtime
    )

    candidate_workflows = normalize_workflows(
        candidate_runtime
    )

    # ======================================================
    # Creator
    # ======================================================

    if (
        "creator" in source_workflows
        and
        "creator" in candidate_workflows
    ):

        explanations.append(
            "🎬 クリエイター用途との相性が高い"
        )

    # ======================================================
    # Gaming
    # ======================================================

    if (
        "gaming" in source_workflows
        and
        "gaming" in candidate_workflows
    ):

        explanations.append(
            "🎮 ゲーミング体験を強化"
        )

    # ======================================================
    # AI
    # ======================================================

    if (
        "ai" in source_workflows
        and
        "ai" in candidate_workflows
    ):

        explanations.append(
            "🧠 AIワークフローが近い"
        )

    # ======================================================
    # Display
    # ======================================================

    if (
        source_runtime.get("display_type")
        ==
        candidate_runtime.get("display_type")
    ):

        explanations.append(
            "🌈 表示特性が近い"
        )

    return explanations[:3]


# ==========================================================
# BUILD EDGE
# ==========================================================

def build_semantic_edge(

    source_product,
    candidate_product,
):

    source_runtime = getattr(

        source_product,

        "semantic_runtime",

        {}
    ) or {}

    candidate_runtime = getattr(

        candidate_product,

        "semantic_runtime",

        {}
    ) or {}

    # ======================================================
    # Runtime Validation
    # ======================================================

    if not valid_runtime(source_runtime):
        return None

    if not valid_runtime(candidate_runtime):
        return None

    # ======================================================
    # Score
    # ======================================================

    score = calculate_semantic_edge_score(

        source_runtime,

        candidate_runtime,
    )

    if score <= 0:
        return None

    # ======================================================
    # Build Edge
    # ======================================================

    return {

        # ==================================================
        # Product
        # ==================================================
        "source_id":
            getattr(
                source_product,
                "id",
                None
            ),

        "target_id":
            getattr(
                candidate_product,
                "id",
                None
            ),

        # ==================================================
        # Semantic
        # ==================================================
        "edge_type":
            determine_edge_type(

                source_runtime,

                candidate_runtime,
            ),

        "score":
            score,

        # ==================================================
        # Human Explanation
        # ==================================================
        "explanations":
            build_edge_explanation(

                source_runtime,

                candidate_runtime,
            ),

        # ==================================================
        # Runtime
        # ==================================================
        "source_product_type":
            source_runtime.get(
                "product_type"
            ),

        "target_product_type":
            candidate_runtime.get(
                "product_type"
            ),

        # ==================================================
        # Workflows
        # ==================================================
        "source_workflows":
            source_runtime.get(
                "workflows",
                []
            ),

        "target_workflows":
            candidate_runtime.get(
                "workflows",
                []
            ),

        # ==================================================
        # Semantic Labels
        # ==================================================
        "target_labels":
            candidate_runtime.get(
                "semantic_labels",
                []
            )[:3],
    }


# ==========================================================
# BUILD GRAPH
# ==========================================================

def build_semantic_graph(

    source_product,
    candidate_products,
    limit=12,
):

    edges = []

    source_id = getattr(
        source_product,
        "id",
        None
    )

    for candidate_product in candidate_products:

        candidate_id = getattr(
            candidate_product,
            "id",
            None
        )

        # ==================================================
        # Self Skip
        # ==================================================

        if source_id == candidate_id:

            continue

        try:

            edge = build_semantic_edge(

                source_product,

                candidate_product,
            )

            if edge:

                edges.append(
                    edge
                )

        except Exception:

            continue

    # ======================================================
    # Sort
    # ======================================================

    edges = sorted(

        edges,

        key=lambda x: x.get(
            "score",
            0
        ),

        reverse=True
    )

    # ======================================================
    # Limit
    # ======================================================

    return edges[:limit]