# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/views/related_v2_view.py

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

from api.services.semantic.v2.related.related_runtime import (
    build_related_runtime,
)


# ==========================================================
# RELATED V2
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_related_v2(

    request,

    unique_id,
):

    limit = request.GET.get(
        "limit",
        20
    )

    try:

        limit = int(
            limit
        )

    except Exception:

        limit = 20

    payload = (

        build_related_runtime(

            unique_id=
                unique_id,

            limit=
                limit,
        )
    )

    return Response(
        payload
    )