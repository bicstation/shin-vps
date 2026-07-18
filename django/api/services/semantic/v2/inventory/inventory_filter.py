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

from django.db.models import QuerySet


# ---------------------------------------------------------
# Exact Match Filters
# ---------------------------------------------------------

EXACT_FILTERS = {
    "site_prefix": "site_prefix",
    "maker": "maker",
    "category": "category",
    "series": "series",
    "cpu": "cpu",
    "gpu": "gpu",
    "memory": "memory",
    "storage": "storage",
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
        return [str(v).strip() for v in value if str(v).strip()]

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
    """
    Apply Reality filters.

    Attribute Logic

        Different attributes:
            AND

        Same attribute:
            OR
    """

    if not filters:
        return queryset

    #
    # Exact Match
    #
    for key, field in EXACT_FILTERS.items():

        values = _normalize_values(filters.get(key))

        if not values:
            continue

        if len(values) == 1:
            queryset = queryset.filter(
                **{field: values[0]}
            )
        else:
            queryset = queryset.filter(
                **{f"{field}__in": values}
            )

    #
    # Range
    #
    for key, (field, operator) in RANGE_FILTERS.items():

        value = filters.get(key)

        if value in (None, ""):
            continue

        queryset = queryset.filter(
            **{f"{field}__{operator}": value}
        )

    return queryset