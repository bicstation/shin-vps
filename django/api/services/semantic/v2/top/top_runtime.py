# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/v2/top/top_runtime.py

from api.services.semantic.v2.authority.authority_runtime import (
build_authority_runtime,
)

from api.services.semantic.v2.discover.discover_runtime import (
build_discover_runtime,
)

from api.services.semantic.v2.ranking.ranking_runtime import (
build_ranking_runtime,
)

# ==========================================================

# TOP RUNTIME

# ==========================================================

def build_top_runtime():


    authority = (
        build_authority_runtime()
    )

    discovery = (
        build_discover_runtime()
    )

    ranking = (
        build_ranking_runtime(
            group_slug="all",
            limit=12,
        )
    )

    groups = authority.get(
        "groups",
        []
    )

    attributes = authority.get(
        "attributes",
        []
    )

    shelves = discovery.get(
        "shelves",
        []
    )

    products = ranking.get(
        "products",
        []
    )

    # ------------------------------------------------------
    # FEATURED GROUPS
    # ------------------------------------------------------

    featured_groups = []

    for shelf in shelves[:8]:

        featured_groups.append({

            "slug":
                shelf.get(
                    "group_slug"
                ),

            "product_count":
                shelf.get(
                    "product_count",
                    0
                ),
        })

    # ------------------------------------------------------
    # FEATURED RANKINGS
    # ------------------------------------------------------

    featured_rankings = [

        {
            "slug": "all",
            "label": "総合ランキング",
        },

        {
            "slug": "usage-ai",
            "label": "AI向けPC",
        },

        {
            "slug": "usage-gaming",
            "label": "ゲーミングPC",
        },

        {
            "slug": "usage-business",
            "label": "ビジネスPC",
        },

        {
            "slug": "usage-creator",
            "label": "クリエイターPC",
        },
    ]

    # ------------------------------------------------------
    # FEATURED PRODUCTS
    # ------------------------------------------------------

    featured_products = []

    for product in products:

        featured_products.append({

            "product_id":
                product.get(
                    "product_id"
                ),

            "unique_id":
                product.get(
                    "unique_id"
                ),

            "semantic_labels":
                product.get(
                    "semantic_labels",
                    []
                ),

            "workflow_tags":
                product.get(
                    "workflow_tags",
                    []
                ),
        })

    # ------------------------------------------------------
    # SEO
    # ------------------------------------------------------

    seo = {

        "title":
            "用途から探せるPC検索サイト",

        "description":
            (
                "AI・ゲーム・ビジネス・"
                "クリエイター向けPCを"
                "用途から探せるPC比較サイト"
            ),

        "keywords": [

            "PC",

            "ノートPC",

            "ゲーミングPC",

            "AI PC",

            "クリエイターPC",
        ],

        "canonical":
            "https://bicstation.com/",

        "schema_jsonld": {},
    }

    # ------------------------------------------------------
    # STATS
    # ------------------------------------------------------

    stats = {

        "total_products":

            ranking.get(
                "product_count",
                0
            ),

        "total_groups":

            len(
                groups
            ),

        "total_attributes":

            len(
                attributes
            ),
    }

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {

        "runtime":
            "top_v2",

        "seo":
            seo,

        "featured_groups":
            featured_groups,

        "featured_rankings":
            featured_rankings,

        "featured_products":
            featured_products,

        "stats":
            stats,

        "semantic_schema_version":

            authority.get(
                "semantic_schema_version"
            ),

        "authority_version":

            authority.get(
                "authority_version"
            ),

        "semantic_authority":

            authority.get(
                "semantic_authority"
            ),

        "ready":
            True,
    }

