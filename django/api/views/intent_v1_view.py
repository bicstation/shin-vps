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

from api.services.semantic.v2.intent.intent_runtime import (
    build_intent_runtime,
)


# ==========================================================
# INTENT V1
# ==========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def semantic_intent_v1(
    request,
):

    message = (

        request.data.get(
            "message",
            ""
        )
    )

    payload = (

        build_intent_runtime(
            message
        )
    )

    return Response(
        payload
    )