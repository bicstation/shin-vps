# -*- coding: utf-8 -*-
# api/views/finder_v2_view.py

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
# DEBUG
# ==========================================================

def log_finder_request(

    attributes,

    groups,

    max_price,

    limit,

):

    print(

        "🔥 FINDER REQUEST",

        {

            "attributes":
                attributes,

            "groups":
                groups,

            "max_price":
                max_price,

            "limit":
                limit,
        },
    )


# ==========================================================
# FINDER V2
# ==========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def semantic_finder_v2(
    request,
):

    payload = request.data

    attributes = (

        payload.get(

            "attributes",

            [],
        )
    )

    groups = (

        payload.get(

            "groups",

            [],
        )
    )

    max_price = (

        payload.get(
            "max_price"
        )
    )

    limit = (

        payload.get(

            "limit",

            100,
        )
    )

    log_finder_request(

        attributes=
            attributes,

        groups=
            groups,

        max_price=
            max_price,

        limit=
            limit,
    )

    runtime = (

        build_finder_runtime(

            selected_attributes=
                attributes,

            selected_groups=
                groups,

            max_price=
                max_price,

            limit=
                limit,
        )
    )

    return Response(
        runtime
    )