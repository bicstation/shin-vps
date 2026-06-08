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

    limit = request.GET.get(
        "limit",
        100
    )

    try:

        limit = int(
            limit
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

    return Response(
        payload
    )