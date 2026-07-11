# -*- coding: utf-8 -*-
# api/services/semantic/v2/seo/seo_runtime.py

# ==========================================================
# BASE
# ==========================================================

def build_seo(

    title,
    description,
    keywords,
    canonical,
    schema_jsonld,

    og_image="/images/ogp/default.webp",

    twitter_card="summary_large_image",

):

    return {

        # --------------------------------------------------
        # Standard SEO
        # --------------------------------------------------

        "title":
            title,

        "description":
            description,

        "keywords":
            keywords,

        "canonical":
            canonical,

        "schema_jsonld":
            schema_jsonld,

        # --------------------------------------------------
        # Open Graph
        # --------------------------------------------------

        "open_graph": {

            "title":
                title,

            "description":
                description,

            "url":
                canonical,

            "image":
                og_image,
        },

        # --------------------------------------------------
        # Twitter
        # --------------------------------------------------

        "twitter": {

            "card":
                twitter_card,

            "title":
                title,

            "description":
                description,

            "image":
                og_image,
        },
    }

# ==========================================================
# TOP
# ==========================================================

def build_top_seo(

    meaning,

    product_count,

    group_count,

    attribute_count,
):

    return build_seo(

        title=(

            f"SHIN CORE LINX | "
            f"{product_count}製品・"
            f"{group_count}カテゴリ"
        ),

        description=(

            f"{product_count}製品、"
            f"{group_count}カテゴリ、"
            f"{attribute_count}属性を持つ"
            f"Semantic Reality Platform"
        ),

        keywords=[

            "PC",

            "AI",

            "Semantic",

            "Discovery",
        ],

        canonical=
            "/",

        schema_jsonld={

            "@context":
                "https://schema.org",

            "@type":
                "WebSite",

            "name":

                meaning.get(
                    "identity"
                ),
        },
    )

# ==========================================================
# DISCOVERY
# ==========================================================

def build_discovery_seo(

    meaning,

    presentation,

    group_slug,

    product_count,
):

    title = (
        presentation.get("title")
        or
        presentation.get("name")
        or
        group_slug
    )

    description = (
        presentation.get("description")
        or
        ""
    )

    return build_seo(

        title=(
            f"{title}におすすめのPC一覧（{product_count}製品）｜BIC STATION"
        ),

        description=(
            f"{description}。"
            f"現在{product_count}製品を掲載しています。"
        ),

        keywords=[

            title,

            presentation.get("name"),

            "PC",

            "BIC STATION",
        ],

        canonical=(
            f"/discover/{group_slug}/"
        ),

        schema_jsonld={

            "@context":
                "https://schema.org",

            "@type":
                "CollectionPage",

            "name":
                title,

            "url":
                f"/pc/discover/{group_slug}/",

            "description":
                description,
        },
    )


# ==========================================================
# RANKING
# ==========================================================

def build_ranking_seo(

    meaning,

    group_name,

    product_count,
):

    return build_seo(

        title=(

            f"{group_name}ランキング"
        ),

        description=(

            f"{group_name}に属する"
            f"{product_count}製品を比較"
        ),

        keywords=[

            group_name,

            "Ranking",

            "PC",
        ],

        canonical=
            "/ranking/",

        schema_jsonld={

            "@context":
                "https://schema.org",

            "@type":
                "ItemList",

            "name":

                meaning.get(
                    "identity"
                ),
        },
    )


# ==========================================================
# FINDER
# ==========================================================

def build_finder_seo(

    meaning,

    product_count,
):

    return build_seo(

        title=
            "PC Finder",

        description=(

            f"{product_count}製品から"
            "最適なPCを探索"
        ),

        keywords=[

            "Finder",

            "PC",

            "Semantic",
        ],

        canonical=
            "/pc-finder/",

        schema_jsonld={

            "@context":
                "https://schema.org",

            "@type":
                "SearchResultsPage",

            "name":

                meaning.get(
                    "identity"
                ),
        },
    )


# ==========================================================
# PRODUCT
# ==========================================================

def build_product_seo(

    meaning,

    product,
):

    return build_seo(

        title=
            product.name,

        description=(

            f"{product.maker}の"
            f"{product.name}"
        ),

        keywords=[

            product.name,

            product.maker,
        ],

        canonical=(

            "/product/"
            f"{product.unique_id}/"
        ),

        schema_jsonld={

            "@context":
                "https://schema.org",

            "@type":
                "Product",

            "name":
                product.name,

            "brand":
                product.maker,
        },
    )


# ==========================================================
# RELATED
# ==========================================================

def build_related_seo(

    meaning,

    product_name,

    related_count,
):

    return build_seo(

        title=(

            f"{product_name}の"
            "関連製品"
        ),

        description=(

            f"{related_count}件の"
            "類似製品を表示"
        ),

        keywords=[

            product_name,

            "Related",

            "PC",
        ],

        canonical=
            "/related/",

        schema_jsonld={

            "@context":
                "https://schema.org",

            "@type":
                "ItemList",

            "name":

                meaning.get(
                    "identity"
                ),
        },
    )


# ==========================================================
# INVENTORY
# ==========================================================

def build_inventory_seo(

    meaning,

    product_count,
):

    return build_seo(

        title=(

            f"PC製品一覧 "
            f"({product_count}製品)"
        ),

        description=(

            f"{product_count}製品の"
            f"Reality Inventory"
        ),

        keywords=[

            "PC",

            "Products",

            "Inventory",

            "Semantic",
        ],

        canonical=
            "/catalog/",

        schema_jsonld={

            "@context":
                "https://schema.org",

            "@type":
                "CollectionPage",

            "name":

                meaning.get(
                    "identity"
                ),
        },
    )