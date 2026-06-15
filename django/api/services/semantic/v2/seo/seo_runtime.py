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
):

    return {

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
            "/pc/top/",

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

    product_count,

    group_count,

    attribute_count,
):

    return build_seo(

        title=(

            f"{group_count}カテゴリ・"
            f"{product_count}製品を探索"
        ),

        description=(

            f"{group_count}カテゴリ、"
            f"{attribute_count}属性から"
            f"{product_count}製品を探索できる"
        ),

        keywords=[

            "Discovery",

            "Semantic",

            "PC",
        ],

        canonical=
            "/pc/discover/",

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
            "/pc/ranking/",

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
            "/pc/finder/",

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

            "/pc/product/"
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
            "/pc/related/",

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
            "/pc/products/",

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