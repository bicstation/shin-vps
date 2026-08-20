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

        filters = {
            "site_prefix": request.GET.get("site_prefix"),
            "maker": request.GET.get("maker"),
            "brand": request.GET.get("brand"),
            "category": request.GET.get("category"),
            "series": request.GET.get("series"),
            "cpu": request.GET.get("cpu"),
            "gpu": request.GET.get("gpu"),
            "memory": request.GET.get("memory"),
            "storage": request.GET.get("storage"),
            "storage_type": request.GET.get("storage_type"),
            "display_size": request.GET.get("display_size"),
            "resolution": request.GET.get("resolution"),
            "panel": request.GET.get("panel"),
            "refresh_rate": request.GET.get("refresh_rate"),
            "touch": request.GET.get("touch"),
            "weight": request.GET.get("weight"),
            "battery": request.GET.get("battery"),
            "os": request.GET.get("os"),
            "wifi": request.GET.get("wifi"),
            "bluetooth": request.GET.get("bluetooth"),
            "camera": request.GET.get("camera"),
            "fingerprint": request.GET.get("fingerprint"),
            "face_id": request.GET.get("face_id"),
            "color": request.GET.get("color"),
            "keyboard": request.GET.get("keyboard"),
            "tenkey": request.GET.get("tenkey"),
            "npu": request.GET.get("npu"),
            "min_price": request.GET.get("min_price"),
            "max_price": request.GET.get("max_price"),
        }

        payload = build_options_runtime(
            filters=filters,
        )

        return Response(payload)