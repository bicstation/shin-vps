# -*- coding: utf-8 -*-
# api/services/semantic/v2/top/top_runtime.py

from collections import Counter

from api.models import PCProduct
from api.services.semantic.v2.authority.authority_runtime import build_authority_runtime
from api.services.semantic.v2.meaning.meaning_runtime import build_top_meaning
from api.services.semantic.v2.seo.seo_runtime import build_top_seo
from api.services.semantic.v2.presentation.presentation_runtime import build_top_presentation


# ==========================================================
# DIRECT PRODUCT SCAN
# ==========================================================

def build_direct_product_runtime(limit=12):
    group_counter = Counter()
    ranked = []

    products = (
        PCProduct.objects
        .filter(is_active=True)
        .only(
            "id",
            "unique_id",
            "name",
            "maker",
            "price",
            "image_url",
            "semantic_runtime",
        )
    )

    for product in products:
        runtime = product.semantic_runtime or {}

        groups = runtime.get(
            "semantic_groups",
            [],
        )

        attributes = runtime.get(
            "semantic_attributes",
            [],
        )

        group_counter.update(
            groups
        )

        ranked.append({
            "product_id":
                product.id,
            "unique_id":
                product.unique_id,
            "name":
                getattr(
                    product,
                    "name",
                    "",
                ),
            "maker":
                getattr(
                    product,
                    "maker",
                    "",
                ),
            "price":
                getattr(
                    product,
                    "price",
                    None,
                ),
            "image_url":
                getattr(
                    product,
                    "image_url",
                    "",
                ),
            "matched_groups":
                groups,
            "semantic_attributes":
                attributes,
        })

    ranked.sort(
        key=lambda x: (
            len(
                x.get(
                    "matched_groups",
                    [],
                )
            ),
            len(
                x.get(
                    "semantic_attributes",
                    [],
                )
            ),
        ),
        reverse=True,
    )

    return (
        group_counter,
        ranked[:limit],
    )


# ==========================================================
# GROUP SHELVES
# ==========================================================

def build_direct_group_shelves(
    authority,
    group_counter,
):
    shelves = []

    for group_info in authority.get(
        "groups",
        [],
    ):
        if (
            group_info.get(
                "parent_group"
            )
            == "adult"
        ):
            continue

        group_slug = group_info.get(
            "group_slug"
        )

        shelves.append({
            **group_info,
            "product_count":
                group_counter.get(
                    group_slug,
                    0,
                ),
        })

    shelves.sort(
        key=lambda x: (
            int(
                x.get(
                    "discovery_priority",
                    0,
                )
            ),
            x.get(
                "product_count",
                0,
            ),
        ),
        reverse=True,
    )

    return shelves


# ==========================================================
# TOP
# ==========================================================

def build_top_runtime():
    print(
        "🔥 TOP RUNTIME SOURCE:",
        __file__,
    )

    print(
        "🔥 TOP → AUTHORITY CALL"
    )

    authority = (
        build_authority_runtime()
    )

    print(
        "🔥 TOP → PRODUCT COUNT DIRECT"
    )

    product_count = (
        PCProduct.objects
        .filter(
            is_active=True
        )
        .count()
    )

    print(
        "🔥 TOP → PRODUCT COUNT",
        product_count,
    )

    print(
        "🔥 TOP → DIRECT PRODUCT SCAN"
    )

    (
        group_counter,
        featured_products,
    ) = build_direct_product_runtime()

    print(
        "🔥 TOP → DIRECT PRODUCT SCAN RESULT",
        {
            "groups":
                len(
                    group_counter
                ),
            "top":
                group_counter.most_common(
                    12
                ),
            "featured_products":
                len(
                    featured_products
                ),
        },
    )

    print(
        "🔥 TOP → GROUP SHELVES"
    )

    featured_groups = (
        build_direct_group_shelves(
            authority=authority,
            group_counter=group_counter,
        )[:12]
    )

    print(
        "🔥 TOP → GROUP SHELVES RESULT",
        [
            (
                shelf.get(
                    "group_slug"
                ),
                shelf.get(
                    "product_count",
                    0,
                ),
            )
            for shelf
            in featured_groups
        ],
    )

    print(
        "🔥 TOP → FEATURED PRODUCTS RESULT",
        [
            (
                product.get(
                    "unique_id"
                ),
                len(
                    product.get(
                        "matched_groups",
                        [],
                    )
                ),
                len(
                    product.get(
                        "semantic_attributes",
                        [],
                    )
                ),
            )
            for product
            in featured_products
        ],
    )

    print(
        "🔥 TOP → MEANING CALL"
    )

    meaning = (
        build_top_meaning()
    )

    print(
        "🔥 TOP → PRESENTATION CALL"
    )

    presentation = (
        build_top_presentation()
    )

    group_count = len(
        authority.get(
            "groups",
            [],
        )
    )

    attribute_count = len(
        authority.get(
            "attributes",
            [],
        )
    )

    seo = build_top_seo(
        meaning=meaning,
        product_count=product_count,
        group_count=group_count,
        attribute_count=attribute_count,
    )

    return {
        "meaning":
            meaning,
        "presentation":
            presentation,
        "seo":
            seo,
        "data": {
            "stats": {
                "product_count":
                    product_count,
                "group_count":
                    group_count,
                "attribute_count":
                    attribute_count,
            },
            "featured_groups":
                featured_groups,
            "featured_products":
                featured_products,
        },
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