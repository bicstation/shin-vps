# -*- coding: utf-8 -*-
# api/services/semantic/v2/requirement/requirement_view.py

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

from api.services.semantic.v2.requirement.requirement_runtime import (
    build_requirement_runtime,
)


# ==========================================================
# REQUIREMENT V1
# ==========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def semantic_requirement_v1(
    request
):

    message = (

        request.data.get(
            "message",
            ""
        )
    )

    payload = (

        build_requirement_runtime(
            message
        )
    )

    return Response(
        payload
    )