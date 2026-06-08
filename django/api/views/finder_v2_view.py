# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/views/finder_v2_view.py

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

from api.services.semantic.v2.finder.finder_runtime import (
    build_finder_runtime,
)


# ==========================================================
# SEMANTIC FINDER V2
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_finder_v2(
    request
):

    selected_attributes = request.GET.getlist(
        "attribute"
    )

    payload = (

        build_finder_runtime(

            selected_attributes=
                selected_attributes
        )
    )

    return Response(
        payload
    )