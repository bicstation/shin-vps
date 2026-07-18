# -*- coding: utf-8 -*-
# api/services/semantic/v2/inventory/inventory_search.py

from django.db.models import (
    Q,
)


# ==========================================================
# INVENTORY SEARCH
# ==========================================================

SEARCH_FIELDS = (

    "name",

    "maker",

    "category",

    "series",

    "cpu",

    "gpu",

)


def apply_inventory_search(

    queryset,

    search=None,

):
    """
    Apply inventory search.

    Responsibility:
        Apply keyword search only.

    Notes:
        Semantic translation is handled separately
        in future versions.
    """

    if not search:
        return queryset

    search = str(search).strip()

    if not search:
        return queryset

    query = Q()

    for field in SEARCH_FIELDS:

        query |= Q(
            **{
                f"{field}__icontains": search
            }
        )

    return queryset.filter(query)