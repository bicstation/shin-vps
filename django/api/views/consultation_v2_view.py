# -*- coding: utf-8 -*-
# api/views/consultation_v2_view.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.services.semantic.v2.consultation.consultation_runtime import (
    build_consultation_runtime,
)


@api_view(["POST"])
@permission_classes([AllowAny])
def semantic_consultation_v2(request):

    message = request.data.get(
        "message",
        "",
    )

    payload = build_consultation_runtime(
        message
    )

    return Response(
        payload
    )