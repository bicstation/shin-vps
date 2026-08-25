# -*- coding: utf-8 -*-
# api/services/semantic/v2/top/top_runtime.py

import time

from django.db import connection

from api.models import PCProduct

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)
from api.services.semantic.v2.meaning.meaning_runtime import (
    build_top_meaning,
)
from api.services.semantic.v2.seo.seo_runtime import (
    build_top_seo,
)
from api.services.semantic.v2.presentation.presentation_runtime import (
    build_top_presentation,
)


# ==========================================================
# FEATURED PRODUCTS
# ==========================================================

def build_direct_featured_products(limit=3):
    started_at = time.perf_counter()

    products = (
        PCProduct.objects
        .filter(is_active=True)
        .order_by("-updated_at")
        .only(
            "id",
            "unique_id",
            "name",
            "maker",
            "price",
            "image_url",
        )[:limit]
    )

    query_started_at = time.perf_counter()
    products = list(products)
    query_completed_at = time.perf_counter()

    print(
        "⏱️ TOP → FEATURED DB:",
        f"{(query_completed_at - query_started_at) * 1000:.2f}ms",
        "products=",
        len(products),
    )

    result = [
        {
            "product_id": product.id,
            "unique_id": product.unique_id,
            "name": product.name,
            "maker": product.maker,
            "price": product.price,
            "image_url": product.image_url,
        }
        for product in products
    ]

    completed_at = time.perf_counter()

    print(
        "⏱️ TOP → FEATURED TOTAL:",
        f"{(completed_at - started_at) * 1000:.2f}ms",
    )

    return result


# ==========================================================
# GROUP COUNTER
# ==========================================================

def build_direct_group_counter():
    started_at = time.perf_counter()

    sql = """
        SELECT
            group_slug,
            COUNT(*) AS product_count
        FROM api_pcproduct,
             jsonb_array_elements_text(
                 semantic_runtime->'semantic_groups'
             ) AS group_slug
        WHERE is_active = TRUE
        GROUP BY group_slug
    """

    query_started_at = time.perf_counter()

    with connection.cursor() as cursor:
        cursor.execute(sql)
        rows = cursor.fetchall()

    query_completed_at = time.perf_counter()

    group_counter = {
        group_slug: product_count
        for group_slug, product_count in rows
    }

    completed_at = time.perf_counter()

    print(
        "⏱️ TOP → GROUP DB:",
        f"{(query_completed_at - query_started_at) * 1000:.2f}ms",
        "groups=",
        len(rows),
    )

    print(
        "⏱️ TOP → GROUP TOTAL:",
        f"{(completed_at - started_at) * 1000:.2f}ms",
        "groups=",
        len(group_counter),
    )

    return group_counter


# ==========================================================
# GROUP SHELVES
# ==========================================================

def build_direct_group_shelves(
    authority,
    group_counter,
):
    shelves = []

    for group_info in authority.get("groups", []):
        if group_info.get("parent_group") == "adult":
            continue

        group_slug = group_info.get("group_slug")

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
    top_started_at = time.perf_counter()

    print(
        "🔥 TOP RUNTIME SOURCE:",
        __file__,
    )

    # ------------------------------------------------------
    # AUTHORITY
    # ------------------------------------------------------

    authority_started_at = time.perf_counter()

    authority = build_authority_runtime()

    authority_completed_at = time.perf_counter()

    print(
        "⏱️ TOP → AUTHORITY:",
        f"{(authority_completed_at - authority_started_at) * 1000:.2f}ms",
    )

    # ------------------------------------------------------
    # PRODUCT COUNT
    # ------------------------------------------------------

    count_started_at = time.perf_counter()

    product_count = (
        PCProduct.objects
        .filter(is_active=True)
        .count()
    )

    count_completed_at = time.perf_counter()

    print(
        "🔥 TOP → PRODUCT COUNT:",
        product_count,
    )

    print(
        "⏱️ TOP → PRODUCT COUNT:",
        f"{(count_completed_at - count_started_at) * 1000:.2f}ms",
    )

    # ------------------------------------------------------
    # FEATURED PRODUCTS
    # ------------------------------------------------------

    print(
        "🔥 TOP → FEATURED PRODUCTS"
    )

    featured_products = (
        build_direct_featured_products(
            limit=3,
        )
    )

    # ------------------------------------------------------
    # GROUP COUNTER
    # ------------------------------------------------------

    group_counter = (
        build_direct_group_counter()
    )

    # ------------------------------------------------------
    # GROUP SHELVES
    # ------------------------------------------------------

    shelves_started_at = time.perf_counter()

    featured_groups = (
        build_direct_group_shelves(
            authority=authority,
            group_counter=group_counter,
        )[:12]
    )

    shelves_completed_at = time.perf_counter()

    print(
        "⏱️ TOP → GROUP SHELVES:",
        f"{(shelves_completed_at - shelves_started_at) * 1000:.2f}ms",
    )

    # ------------------------------------------------------
    # MEANING
    # ------------------------------------------------------

    meaning_started_at = time.perf_counter()

    meaning = build_top_meaning()

    meaning_completed_at = time.perf_counter()

    print(
        "⏱️ TOP → MEANING:",
        f"{(meaning_completed_at - meaning_started_at) * 1000:.2f}ms",
    )

    # ------------------------------------------------------
    # PRESENTATION
    # ------------------------------------------------------

    presentation_started_at = time.perf_counter()

    presentation = build_top_presentation()

    presentation_completed_at = time.perf_counter()

    print(
        "⏱️ TOP → PRESENTATION:",
        f"{(presentation_completed_at - presentation_started_at) * 1000:.2f}ms",
    )

    # ------------------------------------------------------
    # COUNTS
    # ------------------------------------------------------

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

    # ------------------------------------------------------
    # SEO
    # ------------------------------------------------------

    seo_started_at = time.perf_counter()

    seo = build_top_seo(
        meaning=meaning,
        product_count=product_count,
        group_count=group_count,
        attribute_count=attribute_count,
    )

    seo_completed_at = time.perf_counter()

    print(
        "⏱️ TOP → SEO:",
        f"{(seo_completed_at - seo_started_at) * 1000:.2f}ms",
    )

    # ------------------------------------------------------
    # COMPLETE
    # ------------------------------------------------------

    top_completed_at = time.perf_counter()

    print(
        "⏱️ TOP API RUNTIME:",
        f"{(top_completed_at - top_started_at) * 1000:.2f}ms",
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
        "ready": True,
    }