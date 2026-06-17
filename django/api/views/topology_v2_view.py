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

from api.services.semantic.v2.topology.topology_runtime import (
    build_topology_runtime,
)


@api_view(["GET"])
@permission_classes([AllowAny])

def topology_runtime_v2(
    request
):

    return Response(

        build_topology_runtime()
    )