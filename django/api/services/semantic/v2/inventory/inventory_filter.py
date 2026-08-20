"""
Inventory Reality Filter

Responsibility:
    Apply Reality-based filters to the PCProduct queryset.

Notes:
    - Search (Natural Language / Semantic Translation) is NOT handled here.
    - Sort is handled separately.
    - Pagination is handled separately.
    - This module is reusable from Inventory, Finder, Ranking and AI Runtime.
"""

from __future__ import annotations

from django.db.models import Q, QuerySet


# ---------------------------------------------------------
# Exact Match Filters
# ---------------------------------------------------------

EXACT_FILTERS = {
    "site_prefix": "site_prefix",
    "maker": "maker",
    "brand": "brand",
    "category": "category",
    "series": "series",
    "cpu": "cpu_model",
    "gpu": "gpu_model",
    "memory": "memory_gb",
    "storage": "storage_gb",
    "storage_type": "storage_type",
    "display_size": "display_size",
    "resolution": "resolution",
    "panel": "panel",
    "refresh_rate": "refresh_rate",
    "touch": "touch",
    "weight": "weight",
    "battery": "battery",
    "os": "os",
    "wifi": "wifi",
    "bluetooth": "bluetooth",
    "camera": "camera",
    "fingerprint": "fingerprint",
    "face_id": "face_id",
    "color": "color",
    "keyboard": "keyboard",
    "tenkey": "tenkey",
    "npu": "npu",
}


# ---------------------------------------------------------
# Range Filters
# ---------------------------------------------------------

RANGE_FILTERS = {
    "min_price": ("price", "gte"),
    "max_price": ("price", "lte"),
}


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

def _normalize_values(value):
    """
    Normalize filter value.

    Supports:

        maker=Lenovo

        maker=Lenovo,Dell,ASUS
    """

    if value is None:
        return []

    if isinstance(value, (list, tuple)):
        return [
            str(v).strip()
            for v in value
            if str(v).strip()
        ]

    values = [
        item.strip()
        for item in str(value).split(",")
        if item.strip()
    ]

    return values


# ---------------------------------------------------------
# Public
# ---------------------------------------------------------

def apply_inventory_filter(
    queryset: QuerySet,
    filters: dict | None = None,
) -> QuerySet:

    if not filters:
        return queryset

    #
    # Exact Match
    #
    for key, field in EXACT_FILTERS.items():

        values = _normalize_values(
            filters.get(key)
        )

        if not values:
            continue

        print(
            f"[FILTER] {key} = {values}"
        )

        print(
            f"[COUNT] before = {queryset.count()}"
        )

        #
        # Single Value
        #
        if len(values) == 1:

            queryset = queryset.filter(
                **{
                    f"{field}__iexact":
                        values[0]
                }
            )

        #
        # Multiple Values
        #
        else:

            condition = Q()

            for value in values:

                condition |= Q(
                    **{
                        f"{field}__iexact":
                            value
                    }
                )

            queryset = queryset.filter(
                condition
            )

        print(
            f"[COUNT] after  = {queryset.count()}"
        )

    #
    # Range
    #
    for key, (field, operator) in RANGE_FILTERS.items():

        value = filters.get(key)

        if value in (None, ""):
            continue

        print(
            f"[FILTER] {key} = {value}"
        )

        print(
            f"[COUNT] before = {queryset.count()}"
        )

        queryset = queryset.filter(
            **{
                f"{field}__{operator}":
                    value
            }
        )

        print(
            f"[COUNT] after  = {queryset.count()}"
        )

    return queryset