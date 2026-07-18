# -*- coding: utf-8 -*-
# api/services/semantic/v2/inventory/inventory_query.py

from api.models import (
    PCProduct,
)


# ==========================================================
# INVENTORY QUERY
# ==========================================================

def build_inventory_queryset():
    """
    Build base queryset for inventory.

    Responsibility:
        Return the base Reality queryset only.

    Notes:
        - No Search
        - No Filter
        - No Sort
        - No Pagination
    """

    return (

        PCProduct.objects

        .filter(

            is_active=True,

        )

    )