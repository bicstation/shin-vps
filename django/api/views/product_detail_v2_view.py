# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/views/product_detail_v2_view.py

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

from api.services.semantic.v2.product.product_detail_runtime import (
    build_product_detail_runtime,
)


# ==========================================================
# PRODUCT DETAIL V2
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_product_detail_v2(

    request,

    unique_id,
):

    payload = (

        build_product_detail_runtime(

            unique_id=
                unique_id
        )
    )

    return Response(
        payload
    )