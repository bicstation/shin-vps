# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/v2/options/option_builder.py

"""
Catalog Options Builder

Responsibility:
- Runtime Contract を構築する
- Current Filter を Reality QuerySet に適用する
- Reality Source を Contract へ変換する
"""

from api.models import PCProduct

from api.services.semantic.v2.inventory.inventory_filter import (
    apply_inventory_filter,
)

from .option_sources import (
    get_brand_options,
    get_cpu_options,
    get_gpu_options,
    get_maker_options,
    get_memory_options,
    get_series_options,
    get_storage_options,
)


def build_options(
    filters=None,
):
    """
    Build Catalog Options Runtime Contract.

    Current filters are applied to the Product Reality
    before generating dependent options.
    """

    queryset = (
        PCProduct.objects
        .filter(is_active=True)
    )

    queryset = apply_inventory_filter(
        queryset=queryset,
        filters=filters,
    )

    return {
        "maker": build_maker_options(
            queryset=queryset,
        ),
        "brand": build_brand_options(
            queryset=queryset,
        ),
        "series": build_series_options(
            queryset=queryset,
        ),
        "cpu": build_cpu_options(
            queryset=queryset,
        ),
        "gpu": build_gpu_options(
            queryset=queryset,
        ),
        "memory": build_memory_options(
            queryset=queryset,
        ),
        "storage": build_storage_options(
            queryset=queryset,
        ),
    }


def build_maker_options(
    queryset,
):
    return get_maker_options(
        queryset=queryset,
    )


def build_brand_options(
    queryset,
):
    return get_brand_options(
        queryset=queryset,
    )


def build_series_options(
    queryset,
):
    return get_series_options(
        queryset=queryset,
    )


def build_cpu_options(
    queryset,
):
    return get_cpu_options(
        queryset=queryset,
    )


def build_gpu_options(
    queryset,
):
    return get_gpu_options(
        queryset=queryset,
    )


def build_memory_options(
    queryset,
):
    return get_memory_options(
        queryset=queryset,
    )


def build_storage_options(
    queryset,
):
    return get_storage_options(
        queryset=queryset,
    )