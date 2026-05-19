# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/semantic_api_service.py

"""
SHIN CORE LINX
Semantic API Service

backend semantic authority
↓
frontend semantic contract
↓
adaptive cinematic runtime
↓
human exploration payload
"""

from api.models import PCProduct

# ==========================================================
# SEMANTIC GRAPH
# ==========================================================

from api.services.semantic.semantic_graph import (
    build_semantic_graph,
)

# ==========================================================
# SEMANTIC SHELVES
# ==========================================================

from api.services.semantic.semantic_shelves import (
    build_semantic_shelves,
)

# ==========================================================
# CONSTANTS
# ==========================================================

SEMANTIC_SCHEMA_VERSION = 2

SEMANTIC_AUTHORITY = "backend"

DEFAULT_RELATED_LIMIT = 12

DEFAULT_DISCOVERY_LIMIT = 500


# ==========================================================
# UTIL
# ==========================================================

def safe_runtime(product):

    runtime = getattr(
        product,
        "semantic_runtime",
        None
    )

    if not runtime:
        return {}

    return runtime


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


def lightweight_runtime(runtime):

    """
    lightweight semantic payload
    ranking / shelf / hover preview
    """

    return {

        "product_type":
            runtime.get(
                "product_type"
            ),

        "semantic_score":
            runtime.get(
                "semantic_score",
                0
            ),

        "workflow_score":
            runtime.get(
                "workflow_score",
                0
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

        "adaptive_runtime":
            runtime.get(
                "adaptive_runtime",
                {}
            ),
    }


def frontend_render_hints(runtime):

    """
    backend-driven frontend UX authority
    """

    product_type = runtime.get(
        "product_type",
        "pc"
    )

    primary_workflow = runtime.get(
        "primary_workflow"
    )

    # ======================================================
    # Gaming
    # ======================================================

    if product_type == "gaming_pc":

        return {

            "ui_mode":
                "immersive",

            "card_style":
                "gaming",

            "render_priority": [

                "gpu",

                "refresh_rate",

                "workflow",
            ],

            "animation_hint":
                "competitive",

            "focus":
                "gaming",
        }

    # ======================================================
    # Creator
    # ======================================================

    if product_type == "creator_pc":

        return {

            "ui_mode":
                "workflow",

            "card_style":
                "creator",

            "render_priority": [

                "memory",

                "storage",

                "workflow",
            ],

            "animation_hint":
                "creative",

            "focus":
                "creator",
        }

    # ======================================================
    # AI
    # ======================================================

    if product_type == "ai_workstation":

        return {

            "ui_mode":
                "intelligence",

            "card_style":
                "ai",

            "render_priority": [

                "gpu",

                "memory",

                "workflow",
            ],

            "animation_hint":
                "generation",

            "focus":
                "ai",
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

            "ui_mode":
                "cinematic",

            "card_style":
                "display",

            "render_priority": [

                "display",

                "refresh_rate",

                "workflow",
            ],

            "animation_hint":
                "visual",

            "focus":
                "display",
        }

    # ======================================================
    # Mobility
    # ======================================================

    if product_type == "mobility_pc":

        return {

            "ui_mode":
                "lightweight",

            "card_style":
                "portable",

            "render_priority": [

                "mobility",

                "battery",

                "workflow",
            ],

            "animation_hint":
                "mobility",

            "focus":
                "portable",
        }

    # ======================================================
    # Fallback
    # ======================================================

    return {

        "ui_mode":
            "general",

        "card_style":
            "default",

        "render_priority": [

            "workflow",

            "semantic",
        ],

        "animation_hint":
            "exploration",

        "focus":
            primary_workflow or "general",
    }

# ==========================================================
# SEMANTIC RELATED
# IMPORTANT:
# lightweight traversal nodes only
# non-recursive frontend-safe payload
# ==========================================================

def build_semantic_related_products(

    product,

    limit=DEFAULT_RELATED_LIMIT,
):

    runtime = safe_runtime(
        product
    )

    if not runtime:
        return []

    # ======================================================
    # Candidate Query
    # ======================================================

    candidates = PCProduct.objects.exclude(
        id=product.id
    ).exclude(
        semantic_runtime__isnull=True
    )[:200]

    # ======================================================
    # Semantic Graph
    # ======================================================

    edges = build_semantic_graph(

        source_product=product,

        candidate_products=candidates,

        limit=limit,
    )

    related_products = []

    for edge in edges:

        target_id = edge.get(
            "target_id"
        )

        try:

            target_product = PCProduct.objects.get(
                id=target_id
            )

            target_runtime = safe_runtime(
                target_product
            )

            # ==================================================
            # Lightweight Semantic Labels
            # ==================================================

            semantic_labels = (
                target_runtime.get(
                    "semantic_labels",
                    []
                )[:3]
            )

            # ==================================================
            # Edge Payload
            # ==================================================

            semantic_edge = {

                "edge_type":
                    edge.get(
                        "edge_type"
                    ),

                "similarity_score":
                    edge.get(
                        "similarity_score",
                        0
                    ),

                "reason":
                    edge.get(
                        "reason"
                    ),

                "workflow_relation":
                    edge.get(
                        "workflow_relation"
                    ),
            }

            # ==================================================
            # Frontend-safe Node
            # IMPORTANT:
            # no nested semantic universe
            # ==================================================

            related_products.append({

                # ==============================================
                # Product
                # ==============================================
                "id":
                    target_product.id,

                "unique_id":
                    target_product.unique_id,

                "name":
                    target_product.name,

                "image_url":
                    target_product.image_url,

                "price":
                    target_product.price,

                "maker":
                    getattr(
                        target_product,
                        "maker",
                        None
                    ),

                # ==============================================
                # Lightweight Semantic
                # ==============================================
                "product_type":
                    target_runtime.get(
                        "product_type"
                    ),

                "semantic_score":
                    target_runtime.get(
                        "semantic_score",
                        0
                    ),

                "semantic_labels":
                    semantic_labels,

                # ==============================================
                # Traversal Edge
                # ==============================================
                "edge":
                    semantic_edge,
            })

        except Exception:

            continue

    return related_products




# ==========================================================
# PRODUCT PAYLOAD
# ==========================================================

def build_semantic_product_payload(
    product
):

    runtime = safe_runtime(
        product
    )

    return {

        # ==================================================
        # Semantic Contract
        # ==================================================
        "semantic_schema_version":
            SEMANTIC_SCHEMA_VERSION,

        "semantic_authority":
            SEMANTIC_AUTHORITY,

        # ==================================================
        # Product
        # ==================================================
        "id":
            product.id,

        "unique_id":
            product.unique_id,

        "name":
            product.name,

        "image_url":
            product.image_url,

        "price":
            product.price,

        "maker":
            getattr(
                product,
                "maker",
                None
            ),

        "url":
            getattr(
                product,
                "url",
                None
            ),

        # ==================================================
        # Semantic Runtime
        # ==================================================
        "semantic_runtime":
            runtime,

        # ==================================================
        # Human Labels
        # ==================================================
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

        # ==================================================
        # Workflow
        # ==================================================
        "workflows":
            runtime.get(
                "workflows",
                []
            ),

        "primary_workflow":
            runtime.get(
                "primary_workflow"
            ),

        # ==================================================
        # Scores
        # ==================================================
        "semantic_score":
            runtime.get(
                "semantic_score",
                0
            ),

        "workflow_score":
            runtime.get(
                "workflow_score",
                0
            ),

        # ==================================================
        # Adaptive Runtime
        # ==================================================
        "adaptive_runtime":
            runtime.get(
                "adaptive_runtime",
                {}
            ),

        "runtime_profile":
            runtime.get(
                "runtime_profile",
                {}
            ),

        # ==================================================
        # Product Identity
        # ==================================================
        "product_type":
            runtime.get(
                "product_type"
            ),

        "base_type":
            runtime.get(
                "base_type"
            ),

        # ==================================================
        # Frontend Runtime
        # ==================================================
        "render_hints":
            frontend_render_hints(
                runtime
            ),

        # ==================================================
        # Semantic Graph
        # ==================================================
        "semantic_related":
            build_semantic_related_products(
                product
            ),
    }


# ==========================================================
# SHELF PAYLOAD
# ==========================================================

def build_semantic_shelf_payload():

    products = PCProduct.objects.exclude(
        semantic_runtime__isnull=True
    )[:DEFAULT_DISCOVERY_LIMIT]

    shelves = build_semantic_shelves(
        products
    )

    payload = []

    for shelf in shelves:

        shelf_products = []

        for product in shelf.get(
            "products",
            []
        ):

            runtime = safe_runtime(
                product
            )

            shelf_products.append({

                # ==========================================
                # Product
                # ==========================================
                "id":
                    product.id,

                "unique_id":
                    product.unique_id,

                "name":
                    product.name,

                "image_url":
                    product.image_url,

                "price":
                    product.price,

                # ==========================================
                # Semantic
                # ==========================================
                "semantic_runtime":
                    lightweight_runtime(
                        runtime
                    ),

                # ==========================================
                # Human
                # ==========================================
                "semantic_labels":
                    runtime.get(
                        "semantic_labels",
                        []
                    )[:3],

                # ==========================================
                # Frontend
                # ==========================================
                "render_hints":
                    frontend_render_hints(
                        runtime
                    ),
            })

        payload.append({

            # ==============================================
            # Semantic Contract
            # ==============================================
            "semantic_schema_version":
                SEMANTIC_SCHEMA_VERSION,

            # ==============================================
            # Shelf
            # ==============================================
            "shelf_type":
                shelf.get(
                    "shelf_type"
                ),

            "title":
                shelf.get(
                    "title"
                ),

            "description":
                shelf.get(
                    "description"
                ),

            # ==============================================
            # UX Runtime
            # ==============================================
            "ui_mode":
                "exploration",

            # ==============================================
            # Products
            # ==============================================
            "products":
                shelf_products,
        })

    return payload


# ==========================================================
# DISCOVERY PAYLOAD
# ==========================================================

def build_semantic_discovery_payload():

    shelves = build_semantic_shelf_payload()

    return {

        # ==================================================
        # Semantic Contract
        # ==================================================
        "semantic_schema_version":
            SEMANTIC_SCHEMA_VERSION,

        "semantic_authority":
            SEMANTIC_AUTHORITY,

        # ==================================================
        # Runtime
        # ==================================================
        "discovery_runtime":
            "semantic_exploration",

        "ui_mode":
            "cinematic",

        # ==================================================
        # Shelves
        # ==================================================
        "semantic_shelves":
            shelves,
    }


# ==========================================================
# RANKING PAYLOAD
# ==========================================================

def build_semantic_ranking_payload(
    products
):

    payload = []

    for product in products:

        runtime = safe_runtime(
            product
        )

        payload.append({

            # ==============================================
            # Product
            # ==============================================
            "id":
                product.id,

            "unique_id":
                product.unique_id,

            "name":
                product.name,

            "image_url":
                product.image_url,

            "price":
                product.price,

            # ==============================================
            # Lightweight Runtime
            # ==============================================
            "semantic_runtime":
                lightweight_runtime(
                    runtime
                ),

            # ==============================================
            # Human Labels
            # ==============================================
            "semantic_labels":
                runtime.get(
                    "semantic_labels",
                    []
                )[:3],

            # ==============================================
            # Frontend
            # ==============================================
            "render_hints":
                frontend_render_hints(
                    runtime
                ),
        })

    return {

        "semantic_schema_version":
            SEMANTIC_SCHEMA_VERSION,

        "semantic_authority":
            SEMANTIC_AUTHORITY,

        "results":
            payload,
    }