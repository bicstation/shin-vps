# -*- coding: utf-8 -*-


# ==========================================================
# BASE
# ==========================================================

def build_seo_payload(

    page_type,

    title,

    description,

    canonical,

    keywords=None,

    schema_jsonld=None,
):

    return {

        "page_type":
            page_type,

        "title":
            title,

        "description":
            description,

        "keywords":
            keywords or [],

        "canonical":
            canonical,

        "schema_jsonld":
            schema_jsonld or {},
    }


# ==========================================================
# PRODUCT
# ==========================================================

def build_product_seo(

    product,

    semantic_runtime=None,
):

    semantic_runtime = (
        semantic_runtime
        or {}
    )

    labels = (

        semantic_runtime.get(
            "semantic_labels",
            []
        )
    )

    description_parts = []

    if labels:

        description_parts.extend(
            labels[:3]
        )

    description_parts.append(

        f"{product.maker}の"
        f"{product.name}"
    )

    description = "・".join(
        description_parts
    )

    return build_seo_payload(

        page_type=
            "product",

        title=
            product.name,

        description=
            description,

        canonical=
            f"/pc/products/{product.unique_id}/",

        keywords=[

            product.maker,

            product.name,

            *labels,
        ],

        schema_jsonld={

            "@context":
                "https://schema.org",

            "@type":
                "Product",

            "name":
                product.name,

            "brand":
                product.maker,

            "image":

                getattr(
                    product,
                    "image_source",
                    ""
                ),
        },
    )


# ==========================================================
# RANKING
# ==========================================================

def build_ranking_seo(

    group_slug,

    product_count,
):

    return build_seo_payload(

        page_type=
            "ranking",

        title=
            f"{group_slug}ランキング",

        description=
            (
                f"{group_slug}に該当する"
                f"{product_count}件のPCを掲載"
            ),

        canonical=
            f"/pc/ranking/{group_slug}/",

        keywords=[

            group_slug,

            "ランキング",
        ],
    )


# ==========================================================
# DISCOVER
# ==========================================================

def build_discover_seo(

    shelf_count,
):

    return build_seo_payload(

        page_type=
            "discover",

        title=
            "PCディスカバリー",

        description=
            (
                f"{shelf_count}カテゴリから"
                "PCを探索"
            ),

        canonical=
            "/pc/discover/",

        keywords=[

            "PC",

            "Discovery",
        ],
    )