# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/semantic_shelves.py

"""
SHIN CORE LINX
Semantic Shelf Runtime

semantic runtime
↓
workflow understanding
↓
semantic grouping
↓
cinematic exploration rails
↓
human discovery orchestration
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


def workflow_names(runtime):

    workflows = runtime.get(
        "workflows",
        []
    )

    names = []

    for workflow in workflows:

        if isinstance(workflow, dict):

            workflow_name = workflow.get(
                "workflow"
            )

            if workflow_name:

                names.append(
                    workflow_name
                )

        elif isinstance(workflow, str):

            names.append(
                workflow
            )

    return names


def unique_products(products):

    seen = set()

    result = []

    for product in products:

        product_id = getattr(
            product,
            "id",
            None
        )

        if not product_id:
            continue

        if product_id in seen:
            continue

        seen.add(product_id)

        result.append(product)

    return result


def sort_products(products):

    def score(product):

        runtime = getattr(
            product,
            "semantic_runtime",
            {}
        ) or {}

        semantic_score = safe_int(
            runtime.get(
                "semantic_score"
            )
        )

        workflow_score = safe_int(
            runtime.get(
                "workflow_score"
            )
        )

        return (
            semantic_score
            +
            workflow_score
        )

    return sorted(

        products,

        key=score,

        reverse=True
    )


# ==========================================================
# RUNTIME FILTER
# IMPORTANT:
# semantic contamination protection
# ==========================================================

ALLOWED_PRODUCT_TYPES = [

    "pc",

    "gaming_pc",

    "creator_pc",

    "ai_workstation",

    "mobility_pc",

    "monitor",

    "immersive_monitor",

    "creator_monitor",
]


EXCLUDED_PRODUCT_TYPES = [

    "accessory",

    "software",
]


MIN_SEMANTIC_SCORE = 10


def valid_runtime(product):

    runtime = getattr(
        product,
        "semantic_runtime",
        {}
    ) or {}

    product_type = runtime.get(
        "product_type"
    )

    semantic_score = safe_int(

        runtime.get(
            "semantic_score",
            0
        )
    )

    # ======================================================
    # Excluded
    # ======================================================

    if product_type in EXCLUDED_PRODUCT_TYPES:

        return False

    # ======================================================
    # Allowed
    # ======================================================

    if (
        product_type
        not in
        ALLOWED_PRODUCT_TYPES
    ):

        return False

    # ======================================================
    # Semantic Quality
    # ======================================================

    if semantic_score < MIN_SEMANTIC_SCORE:

        return False

    return True


# ==========================================================
# SHELF RULES
# ==========================================================

SHELF_RULES = {

    # ======================================================
    # AI
    # ======================================================
    "ai_workflow": {

        "title":
            "🧠 AI Workflow",

        "description":
            "AI生成・次世代ワークフロー向け",

        "priority":
            100,

        "ui_mode":
            "intelligence",
    },

    # ======================================================
    # Creator
    # ======================================================
    "creator_workflow": {

        "title":
            "🎬 Creator Workflow",

        "description":
            "動画編集・配信・制作向け",

        "priority":
            90,

        "ui_mode":
            "creative",
    },

    # ======================================================
    # Gaming
    # ======================================================
    "gaming_setup": {

        "title":
            "🎮 Gaming Setup",

        "description":
            "FPS・高性能ゲーミング向け",

        "priority":
            80,

        "ui_mode":
            "immersive",
    },

    # ======================================================
    # Immersive
    # ======================================================
    "immersive_display": {

        "title":
            "🌈 Immersive Display",

        "description":
            "OLED・高リフレッシュ映像体験",

        "priority":
            70,

        "ui_mode":
            "cinematic",
    },

    # ======================================================
    # Mobility
    # ======================================================
    "mobility_workflow": {

        "title":
            "✈ Mobility Workflow",

        "description":
            "外出・カフェ・軽量作業向け",

        "priority":
            60,

        "ui_mode":
            "portable",
    },

    # ======================================================
    # Semantic Rich
    # ======================================================
    "semantic_richness": {

        "title":
            "🚀 Semantic High-End",

        "description":
            "高い意味価値を持つ製品",

        "priority":
            95,

        "ui_mode":
            "exploration",
    },

    # ======================================================
    # Evolution
    # ======================================================
    "workflow_evolution": {

        "title":
            "🧭 Workflow Evolution",

        "description":
            "次の探索へ繋がる進化ライン",

        "priority":
            85,

        "ui_mode":
            "journey",
    },
}


# ==========================================================
# SHELF BASE
# ==========================================================

def build_shelf_payload(

    shelf_type,
    products,
):

    if not products:
        return None

    products = unique_products(
        products
    )

    products = sort_products(
        products
    )

    rule = SHELF_RULES.get(
        shelf_type,
        {}
    )

    return {

        "shelf_type":
            shelf_type,

        "title":
            rule.get(
                "title"
            ),

        "description":
            rule.get(
                "description"
            ),

        "priority":
            rule.get(
                "priority",
                0
            ),

        "ui_mode":
            rule.get(
                "ui_mode",
                "general"
            ),

        "products":
            products[:12],
    }


# ==========================================================
# AI SHELF
# ==========================================================

def build_ai_workflow_shelf(products):

    shelf_products = []

    for product in products:

        if not valid_runtime(product):
            continue

        runtime = getattr(
            product,
            "semantic_runtime",
            {}
        ) or {}

        workflows = workflow_names(
            runtime
        )

        if "ai" not in workflows:
            continue

        shelf_products.append(
            product
        )

    return build_shelf_payload(

        "ai_workflow",

        shelf_products,
    )


# ==========================================================
# CREATOR SHELF
# ==========================================================

def build_creator_workflow_shelf(products):

    shelf_products = []

    for product in products:

        if not valid_runtime(product):
            continue

        runtime = getattr(
            product,
            "semantic_runtime",
            {}
        ) or {}

        workflows = workflow_names(
            runtime
        )

        if "creator" not in workflows:
            continue

        shelf_products.append(
            product
        )

    return build_shelf_payload(

        "creator_workflow",

        shelf_products,
    )


# ==========================================================
# GAMING SHELF
# ==========================================================

def build_gaming_shelf(products):

    shelf_products = []

    for product in products:

        if not valid_runtime(product):
            continue

        runtime = getattr(
            product,
            "semantic_runtime",
            {}
        ) or {}

        workflows = workflow_names(
            runtime
        )

        gpu_model = runtime.get(
            "gpu_model"
        )

        if "gaming" not in workflows:
            continue

        if not gpu_model:
            continue

        shelf_products.append(
            product
        )

    return build_shelf_payload(

        "gaming_setup",

        shelf_products,
    )


# ==========================================================
# IMMERSIVE SHELF
# ==========================================================

def build_immersive_display_shelf(products):

    shelf_products = []

    for product in products:

        if not valid_runtime(product):
            continue

        runtime = getattr(
            product,
            "semantic_runtime",
            {}
        ) or {}

        display_type = runtime.get(
            "display_type"
        )

        refresh_rate = safe_int(

            runtime.get(
                "refresh_rate"
            )
        )

        # ==================================================
        # OLED
        # ==================================================

        if display_type in [

            "OLED",

            "QD-OLED",
        ]:

            shelf_products.append(
                product
            )

            continue

        # ==================================================
        # High Refresh
        # ==================================================

        if refresh_rate >= 240:

            shelf_products.append(
                product
            )

    return build_shelf_payload(

        "immersive_display",

        shelf_products,
    )


# ==========================================================
# MOBILITY SHELF
# ==========================================================

def build_mobility_shelf(products):

    shelf_products = []

    for product in products:

        if not valid_runtime(product):
            continue

        runtime = getattr(
            product,
            "semantic_runtime",
            {}
        ) or {}

        workflows = workflow_names(
            runtime
        )

        if "mobility" not in workflows:
            continue

        shelf_products.append(
            product
        )

    return build_shelf_payload(

        "mobility_workflow",

        shelf_products,
    )


# ==========================================================
# SEMANTIC RICHNESS SHELF
# ==========================================================

def build_semantic_richness_shelf(products):

    shelf_products = []

    for product in products:

        if not valid_runtime(product):
            continue

        runtime = getattr(
            product,
            "semantic_runtime",
            {}
        ) or {}

        semantic_score = safe_int(

            runtime.get(
                "semantic_score"
            )
        )

        if semantic_score < 70:
            continue

        shelf_products.append(
            product
        )

    return build_shelf_payload(

        "semantic_richness",

        shelf_products,
    )


# ==========================================================
# EVOLUTION SHELF
# ==========================================================

def build_workflow_evolution_shelf(products):

    shelf_products = []

    evolution_types = [

        "gaming_pc",

        "creator_pc",

        "ai_workstation",
    ]

    for product in products:

        if not valid_runtime(product):
            continue

        runtime = getattr(
            product,
            "semantic_runtime",
            {}
        ) or {}

        product_type = runtime.get(
            "product_type"
        )

        if product_type not in evolution_types:
            continue

        shelf_products.append(
            product
        )

    return build_shelf_payload(

        "workflow_evolution",

        shelf_products,
    )


# ==========================================================
# PRIORITY SORT
# ==========================================================

def sort_shelves(shelves):

    shelves = [

        shelf

        for shelf in shelves

        if shelf
    ]

    return sorted(

        shelves,

        key=lambda x: x.get(
            "priority",
            0
        ),

        reverse=True
    )


# ==========================================================
# MAIN
# ==========================================================

def build_semantic_shelves(products):

    """
    semantic cinematic exploration rails
    """

    shelves = []

    shelf_builders = [

        # ==================================================
        # AI
        # ==================================================

        build_ai_workflow_shelf,

        # ==================================================
        # Creator
        # ==================================================

        build_creator_workflow_shelf,

        # ==================================================
        # Gaming
        # ==================================================

        build_gaming_shelf,

        # ==================================================
        # Immersive
        # ==================================================

        build_immersive_display_shelf,

        # ==================================================
        # Mobility
        # ==================================================

        build_mobility_shelf,

        # ==================================================
        # Rich Semantic
        # ==================================================

        build_semantic_richness_shelf,

        # ==================================================
        # Evolution
        # ==================================================

        build_workflow_evolution_shelf,
    ]

    for shelf_builder in shelf_builders:

        try:

            shelf = shelf_builder(
                products
            )

            if shelf:

                shelves.append(
                    shelf
                )

        except Exception:

            continue

    # ======================================================
    # Sort
    # ======================================================

    shelves = sort_shelves(
        shelves
    )

    return shelves