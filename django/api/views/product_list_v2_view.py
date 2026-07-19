# -*- coding: utf-8 -*-
# api/views/product_list_v2_view.py

from rest_framework.decorators import (    api_view,    permission_classes,)
from rest_framework.permissions import (     AllowAny,)
from rest_framework.response import (     Response,)
from api.services.semantic.v2.inventory.inventory_runtime import (     build_inventory_runtime,)


# ==========================================================
# PRODUCT LIST V2
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_product_list_v2(
    request,
):

    # ------------------------------------------------------
    # PARAMETER
    # ------------------------------------------------------

    page = request.GET.get(
        "page",
        1,
    )

    page_size = request.GET.get(
        "page_size",
        20,
    )

    sort = request.GET.get(
        "sort",
        "new",
    )

    search = request.GET.get(
        "search",
    )

    # ------------------------------------------------------
    # FILTERS
    # ------------------------------------------------------

    filters = {

        "site_prefix":
            request.GET.get("site_prefix"),

        "maker":
            request.GET.get("maker"),

        "category":
            request.GET.get("category"),

        "series":
            request.GET.get("series"),

        "cpu":
            request.GET.get("cpu"),

        "gpu":
            request.GET.get("gpu"),

        "memory":
            request.GET.get("memory"),

        "storage":
            request.GET.get("storage"),

        "storage_type":
            request.GET.get("storage_type"),

        "display_size":
            request.GET.get("display_size"),

        "resolution":
            request.GET.get("resolution"),

        "panel":
            request.GET.get("panel"),

        "refresh_rate":
            request.GET.get("refresh_rate"),

        "touch":
            request.GET.get("touch"),

        "weight":
            request.GET.get("weight"),

        "battery":
            request.GET.get("battery"),

        "os":
            request.GET.get("os"),

        "wifi":
            request.GET.get("wifi"),

        "bluetooth":
            request.GET.get("bluetooth"),

        "camera":
            request.GET.get("camera"),

        "fingerprint":
            request.GET.get("fingerprint"),

        "face_id":
            request.GET.get("face_id"),

        "color":
            request.GET.get("color"),

        "keyboard":
            request.GET.get("keyboard"),

        "tenkey":
            request.GET.get("tenkey"),

        "npu":
            request.GET.get("npu"),

        "min_price":
            request.GET.get("min_price"),

        "max_price":
            request.GET.get("max_price"),
    }

    # ------------------------------------------------------
    # RUNTIME
    # ------------------------------------------------------

    payload = (

        build_inventory_runtime(

            page=
                page,

            page_size=
                page_size,

            sort=
                sort,

            search=
                search,

            filters=
                filters,
        )
    )

    return Response(
        payload
    )