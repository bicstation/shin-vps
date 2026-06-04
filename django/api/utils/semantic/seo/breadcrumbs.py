# =========================================================
# SHIN CORE LINX｜Semantic Breadcrumb Runtime
# /api/utils/semantic/seo/breadcrumbs.py
# =========================================================


# =========================================================
# Generate Semantic Breadcrumbs
# =========================================================

def generate_semantic_breadcrumbs(
    attribute
):

    slug = attribute.slug

    name = attribute.name

    attr_type = attribute.attr_type


    breadcrumbs = [

        {
            "name": "Home",
            "url": "/"
        },

        {
            "name": "ランキング",
            "url": "/ranking/"
        }
    ]


    # =====================================================
    # Attribute Type Layer
    # =====================================================

    if attr_type == "usage":

        breadcrumbs.append({

            "name": "用途別ランキング",

            "url":
                "/ranking/usage/"
        })


    elif attr_type == "gpu":

        breadcrumbs.append({

            "name": "GPU別ランキング",

            "url":
                "/ranking/gpu/"
        })


    elif attr_type == "cpu":

        breadcrumbs.append({

            "name": "CPU別ランキング",

            "url":
                "/ranking/cpu/"
        })


    elif attr_type == "maker":

        breadcrumbs.append({

            "name": "メーカー別ランキング",

            "url":
                "/ranking/maker/"
        })


    # =====================================================
    # Current Page
    # =====================================================

    breadcrumbs.append({

        "name": name,

        "url":
            f"/ranking/{slug}/"
    })


    return breadcrumbs