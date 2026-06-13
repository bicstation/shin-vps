# -*- coding: utf-8 -*-

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

from api.services.semantic.v2.top.top_runtime import (
    build_top_runtime,
)


# ==========================================================
# TOP V2
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_top_v2(
    request
):

    payload = (
        build_top_runtime()
    )

    return Response(
        payload
    )