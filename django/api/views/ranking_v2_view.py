# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/views/ranking_v2_view.py

from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from rest_framework.permissions import (
    AllowAny,
)

from rest_framework.response import (
    Response,
)

from api.services.semantic.v2.ranking.ranking_runtime import (
    build_ranking_runtime,
)


# ==========================================================
# SEMANTIC RANKING V2
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_ranking_v2(

    request,

    group_slug,
):

    print("RANKING VIEW")
    print(group_slug)

    limit = request.GET.get(
        "limit",
        100,
    )

    try:

        limit = int(
            limit,
        )

    except Exception:

        limit = 100

    payload = (

        build_ranking_runtime(

            group_slug=
                group_slug,

            limit=
                limit,
        )
    )

    # ======================================================
    # DEBUG
    # ======================================================

    products = payload["data"]["products"]

    payload["_debug"] = {

        "group_slug":
            group_slug,

        "product_count":
            len(products),
    }

    if products:

        payload["_debug"].update({

            "unique_id":
                products[0]["unique_id"],

            "image_url":
                products[0]["image_url"],
        })

    # ======================================================
    # CONSOLE DEBUG
    # ======================================================

    print()
    print("=" * 80)
    print("RANKING DEBUG")
    print(f"group_slug   : {group_slug}")
    print(f"product_count: {len(products)}")

    if products:

        print(
            products[0]["unique_id"]
        )

        print(
            repr(
                products[0]["image_url"]
            )
        )

    else:

        print("NO PRODUCTS")

    print("=" * 80)
    print()

    return Response(
        payload
    )