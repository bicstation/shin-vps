# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/views/product_list_v2_view.py

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

from api.services.semantic.v2.inventory.inventory_runtime import (
    build_inventory_runtime,
)


# ==========================================================
# PRODUCT LIST V2
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_product_list_v2(
    request,
):

    page = request.GET.get(
        "page",
        1
    )

    page_size = request.GET.get(
        "page_size",
        10000
    )

    payload = (

        build_inventory_runtime(

            page=
                page,

            page_size=
                page_size,
        )
    )

    return Response(
        payload
    )