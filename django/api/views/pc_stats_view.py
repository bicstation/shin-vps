# /home/maya/shin-dev/shin-vps/django/api/views/pc_stats_view.py

from collections import defaultdict
import re

from django.db.models import Count

from rest_framework.decorators import (
    api_view,
    permission_classes
)

from rest_framework.permissions import (
    AllowAny
)

from rest_framework.response import (
    Response
)

from api.models import (
    PCProduct,
    PCAttribute
)


# =========================================================
# slug normalize
# =========================================================
def normalize_slug(text: str) -> str:

    if not text:
        return ""

    text = text.lower()

    text = re.sub(
        r'[^a-z0-9]+',
        '-',
        text
    )

    text = re.sub(
        r'-+',
        '-',
        text
    )

    return text.strip('-')


# =========================================================
# GPU display normalize
# =========================================================
def clean_gpu_name(raw: str) -> str:

    if not raw:
        return ""

    n = raw.strip()

    # -----------------------------------------------------
    # NVIDIA
    # -----------------------------------------------------
    n = (
        n
        .replace("GeForce ", "")
        .replace("NVIDIA ", "")
    )

    # -----------------------------------------------------
    # Intel
    # -----------------------------------------------------
    low = n.lower()

    if "intel" in low:

        if "arc" in low:
            return "Intel Arc"

        # CPU contamination
        if (
            "core" in low
            or "processor" in low
        ):
            return ""

        return "Intel"

    # -----------------------------------------------------
    # AMD
    # -----------------------------------------------------
    n = n.replace(
        "Radeon ",
        ""
    )

    # -----------------------------------------------------
    # Graphics suffix
    # -----------------------------------------------------
    n = n.replace(
        " Graphics",
        ""
    )

    # -----------------------------------------------------
    # whitespace
    # -----------------------------------------------------
    n = re.sub(
        r'\s+',
        ' ',
        n
    ).strip()

    return n


# =========================================================
# Sidebar Stats API
# =========================================================
@api_view(["GET"])
@permission_classes([AllowAny])
def pc_sidebar_stats(request):

    # =====================================================
    # semantic attributes
    # =====================================================
    attrs = (

        PCAttribute.objects

        .filter(
            pc_products__is_active=True,
            pc_products__unified_genre="PC"
        )

        .annotate(
            product_count=Count(
                "pc_products",
                distinct=True
            )
        )

        .filter(
            product_count__gt=0
        )

        .order_by(
            "attr_type",
            "-product_count"
        )
    )

    # =====================================================
    # grouped sidebar
    # =====================================================
    sidebar = defaultdict(list)

    seen_gpu = set()

    for attr in attrs:

        key = attr.attr_type

        # -------------------------------------------------
        # GPU normalize
        # -------------------------------------------------
        if key == "gpu":

            clean_name = clean_gpu_name(
                attr.name
            )

            if not clean_name:
                continue

            slug = (
                f"gpu-{normalize_slug(clean_name)}"
            )

            # duplicate prevention
            if slug in seen_gpu:
                continue

            seen_gpu.add(slug)

            sidebar[key].append({

                "name":
                    clean_name,

                "slug":
                    slug,

                "count":
                    attr.product_count,

                "icon":
                    attr.icon,

                "color":
                    attr.color,

                "semantic_role":
                    attr.semantic_role,

                "semantic_weight":
                    attr.semantic_weight,
            })

            continue

        # -------------------------------------------------
        # generic semantic attributes
        # -------------------------------------------------
        sidebar[key].append({

            "name":
                attr.name,

            "slug":
                attr.slug,

            "count":
                attr.product_count,

            "icon":
                attr.icon,

            "color":
                attr.color,

            "semantic_role":
                attr.semantic_role,

            "semantic_weight":
                attr.semantic_weight,
        })

    # =====================================================
    # limit
    # =====================================================
    result = {}

    for key, values in sidebar.items():

        result[key] = values[:10]

    return Response(result)