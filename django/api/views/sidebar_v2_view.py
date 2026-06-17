# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/views/sidebar_v2_view.py

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

from api.services.semantic.v2.sidebar.sidebar_runtime import (
    build_sidebar_runtime,
)


# ==========================================================
# SIDEBAR V2
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def sidebar_v2(
    request
):

    return Response(

        build_sidebar_runtime()
    )