# -*- coding: utf-8 -*-
# api/services/semantic/v2/top/top_runtime.py

from api.services.semantic.v2.authority.authority_runtime import build_authority_runtime
from api.services.semantic.v2.traversal.traversal_builder import build_traversal_runtime
from api.services.semantic.v2.discover.discover_runtime import build_discover_runtime
from api.services.semantic.v2.meaning.meaning_runtime import build_top_meaning
from api.services.semantic.v2.seo.seo_runtime import build_top_seo
from api.services.semantic.v2.presentation.presentation_runtime import build_top_presentation


# ==========================================================
# FEATURED PRODUCTS
# ==========================================================

def build_featured_products(products, limit=12):
    ranked = sorted(
        products,
        key=lambda x: (
            len(x.get("matched_groups", [])),
            len(x.get("semantic_attributes", [])),
        ),
        reverse=True,
    )
    return ranked[:limit]


# ==========================================================
# TOP
# ==========================================================

def build_top_runtime():
    print("🔥 TOP RUNTIME SOURCE:", __file__)
    print("🔥 TOP → AUTHORITY CALL")

    authority = build_authority_runtime()

    print("🔥 TOP → TRAVERSAL CALL")

    traversal = build_traversal_runtime()

    print("🔥 TOP → TRAVERSAL RETURN", {
        "product_count": traversal.get("product_count", 0),
        "products": len(traversal.get("products", [])),
    })

    print("🔥 TOP → DISCOVER CALL")

    discovery = build_discover_runtime(
        traversal=traversal,
    )

    print("🔥 TOP → MEANING CALL")

    meaning = build_top_meaning()

    print("🔥 TOP → PRESENTATION CALL")

    presentation = build_top_presentation()

    products = traversal.get("products", [])
    product_count = traversal.get("product_count", 0)
    group_count = len(authority.get("groups", []))
    attribute_count = len(authority.get("attributes", []))

    featured_groups = (
        discovery
        .get("data", {})
        .get("shelves", [])[:12]
    )

    featured_products = build_featured_products(products)

    seo = build_top_seo(
        meaning=meaning,
        product_count=product_count,
        group_count=group_count,
        attribute_count=attribute_count,
    )

    return {
        "meaning": meaning,
        "presentation": presentation,
        "seo": seo,
        "data": {
            "stats": {
                "product_count": product_count,
                "group_count": group_count,
                "attribute_count": attribute_count,
            },
            "featured_groups": featured_groups,
            "featured_products": featured_products,
        },
        "semantic_schema_version": authority.get("semantic_schema_version"),
        "authority_version": authority.get("authority_version"),
        "semantic_authority": authority.get("semantic_authority"),
        "ready": True,
    }