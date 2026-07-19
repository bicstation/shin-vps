# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/views/catalog_options_view.py

"""
Catalog Options View

Responsibility:
- Catalog Options Runtime HTTP Endpoint
"""

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from api.services.semantic.v2.options.options_runtime import (
    build_options_runtime,
)


class CatalogOptionsView(APIView):
    """
    GET /api/pc/options/
    """

    permission_classes = [AllowAny]

    def get(self, request):
        return Response(build_options_runtime())