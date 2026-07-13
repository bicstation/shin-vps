# -*- coding: utf-8 -*-
# api/services/semantic/v2/inventory/inventory_sort.py

# ==========================================================
# INVENTORY SORT
# ==========================================================

def apply_inventory_sort(

    queryset,

    sort,

):

    if sort == "price_low":

        return queryset.order_by(
            "price",
            "-updated_at",
        )

    if sort == "price_high":

        return queryset.order_by(
            "-price",
            "-updated_at",
        )

    if sort == "maker":

        return queryset.order_by(
            "maker",
            "name",
        )

    if sort == "name":

        return queryset.order_by(
            "name",
        )

    # ------------------------------------------------------
    # DEFAULT
    # ------------------------------------------------------

    return queryset.order_by(
        "-updated_at",
    )