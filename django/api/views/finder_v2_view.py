# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/views/finder_v2_view.py

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
# FINDER V2
# ==========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def semantic_finder_v2(
    request
):

    payload = (

        build_finder_runtime(

            selected_attributes=
                request.data.get(
                    "attributes",
                    []
                ),

            selected_groups=
                request.data.get(
                    "groups",
                    []
                ),
                
            max_price=
                request.data.get(
                    "max_price"
                ),

            limit=
                request.data.get(
                    "limit",
                    100
                ),
        )
    )

    print(
        "🔥 REQUEST DATA",
        request.data
    )
    
    
    print(
        "🔥 FINDER REQUEST",
        {
            "attributes":
                request.data.get(
                    "attributes",
                    []
                ),

            "groups":
                request.data.get(
                    "groups",
                    []
                ),

            "max_price":
                request.data.get(
                    "max_price"
                ),
        }
    )

    return Response(
        payload
    )