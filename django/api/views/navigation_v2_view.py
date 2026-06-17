# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/views/navigation_v2_view.py

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

from api.services.semantic.v2.navigation.navigation_runtime import (
    build_navigation_runtime,
)


# ==========================================================
# NAVIGATION V2
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def navigation_v2(
    request
):

    payload = (

        build_navigation_runtime()

    )

    return Response(
        payload
    )