# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/views/discover_v2_view.py

from rest_framework.decorators import ( api_view,  permission_classes, )
from rest_framework.permissions import (  AllowAny, )
from rest_framework.response import ( Response, )
from api.services.semantic.v2.discover.discover_runtime import ( build_discover_runtime, )
from api.services.semantic.v2.discover.group_identity_runtime import ( build_group_identity_runtime, )

# ==========================================================
# DISCOVERY V2
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_discover_v2(
    request
):

    payload = (
        build_discover_runtime()
    )

    return Response(
        payload
    )
    

# ==========================================================
# DISCOVERY DETAIL V2
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_discover_detail_v2(

    request,

    group_slug,
):

    payload = (

        build_group_identity_runtime(

            group_slug
        )
    )

    return Response(
        payload
    )