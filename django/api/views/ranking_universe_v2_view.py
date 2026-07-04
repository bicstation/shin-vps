# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/views/ranking_universe_v2_view.py

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

from api.services.semantic.v2.ranking.ranking_universe_runtime import (
    build_ranking_universe_runtime,
)


# ==========================================================
# RANKING UNIVERSE V2
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_ranking_universe_v2(request):

    return Response(
        build_ranking_universe_runtime()
    )