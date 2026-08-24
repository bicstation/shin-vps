# -*- coding: utf-8 -*-

import time

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
def semantic_top_v2(request):

    started_at = time.perf_counter()

    payload = build_top_runtime()

    elapsed = (
        time.perf_counter() - started_at
    ) * 1000

    print(
        f"⏱️ TOP API RUNTIME: {elapsed:.2f}ms"
    )

    return Response(
        payload
    )