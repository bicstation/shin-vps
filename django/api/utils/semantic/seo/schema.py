# /home/maya/shin-dev/shin-vps/django/api/utils/semantic/seo/schema.py

# =========================================================
# SHIN CORE LINX｜Semantic Schema Runtime
# /api/utils/semantic/seo/schema.py
# =========================================================


# =========================================================
# Generate Semantic Schemas
# =========================================================

def generate_semantic_schemas(

    attribute,

    seo,

    faq,

    breadcrumbs,

):

    slug = attribute.slug

    name = attribute.name


    # =====================================================
    # Breadcrumb Schema
    # =====================================================

    breadcrumb_items = []

    for index, item in enumerate(
        breadcrumbs
    ):

        breadcrumb_items.append({

            "@type": "ListItem",

            "position":
                index + 1,

            "name":
                item["name"],

            "item":
                item["url"],
        })


    breadcrumb_schema = {

        "@context":
            "https://schema.org",

        "@type":
            "BreadcrumbList",

        "itemListElement":
            breadcrumb_items,
    }


    # =====================================================
    # FAQ Schema
    # =====================================================

    faq_entities = []

    for item in faq:

        faq_entities.append({

            "@type":
                "Question",

            "name":
                item["question"],

            "acceptedAnswer": {

                "@type":
                    "Answer",

                "text":
                    item["answer"],
            }
        })


    faq_schema = {

        "@context":
            "https://schema.org",

        "@type":
            "FAQPage",

        "mainEntity":
            faq_entities,
    }


    # =====================================================
    # CollectionPage Schema
    # =====================================================

    collection_schema = {

        "@context":
            "https://schema.org",

        "@type":
            "CollectionPage",

        "name":
            seo.get("title"),

        "description":
            seo.get("description"),

        "url":
            f"/ranking/{slug}/",
    }


    # =====================================================
    # Return
    # =====================================================

    return {

        "breadcrumb_schema":
            breadcrumb_schema,

        "faq_schema":
            faq_schema,

        "collection_schema":
            collection_schema,
    }