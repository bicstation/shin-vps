# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/v2/options/option_sources.py

"""
Catalog Option Sources

Responsibility:
- Reality Source から Option を取得する
- QuerySet を Option Contract へ変換する
"""

from django.db.models import Count, QuerySet


def get_maker_options(
    queryset: QuerySet,
):
    """Build Maker Options."""

    queryset = (
        queryset
        .exclude(maker__isnull=True)
        .exclude(maker="")
        .values("maker")
        .annotate(count=Count("id"))
        .order_by("maker")
    )

    return [
        {
            "value": item["maker"],
            "label": item["maker"].upper(),
            "count": item["count"],
        }
        for item in queryset
    ]


def get_brand_options(
    queryset: QuerySet,
):
    """Build Brand Options."""

    queryset = (
        queryset
        .exclude(brand__isnull=True)
        .exclude(brand="")
        .values("brand")
        .annotate(count=Count("id"))
        .order_by("brand")
    )

    return [
        {
            "value": item["brand"],
            "label": item["brand"],
            "count": item["count"],
        }
        for item in queryset
    ]


def get_series_options(
    queryset: QuerySet,
):
    """Build Series Options."""

    queryset = (
        queryset
        .exclude(series__isnull=True)
        .exclude(series="")
        .values("series")
        .annotate(count=Count("id"))
        .order_by("series")
    )

    return [
        {
            "value": item["series"],
            "label": item["series"],
            "count": item["count"],
        }
        for item in queryset
    ]


def get_cpu_options(
    queryset: QuerySet,
):
    """Build CPU Options."""

    queryset = (
        queryset
        .exclude(cpu_model__isnull=True)
        .exclude(cpu_model="")
        .values("cpu_model")
        .annotate(count=Count("id"))
        .order_by("cpu_model")
    )

    return [
        {
            "value": item["cpu_model"],
            "label": item["cpu_model"],
            "count": item["count"],
        }
        for item in queryset
    ]


def get_gpu_options(
    queryset: QuerySet,
):
    """Build GPU Options."""

    queryset = (
        queryset
        .exclude(gpu_model__isnull=True)
        .exclude(gpu_model="")
        .values("gpu_model")
        .annotate(count=Count("id"))
        .order_by("gpu_model")
    )

    return [
        {
            "value": item["gpu_model"],
            "label": item["gpu_model"],
            "count": item["count"],
        }
        for item in queryset
    ]


def get_memory_options(
    queryset: QuerySet,
):
    """Build Memory Options."""

    queryset = (
        queryset
        .exclude(memory_gb__isnull=True)
        .exclude(memory_gb=0)
        .values("memory_gb")
        .annotate(count=Count("id"))
        .order_by("memory_gb")
    )

    return [
        {
            "value": item["memory_gb"],
            "label": f'{item["memory_gb"]} GB',
            "count": item["count"],
        }
        for item in queryset
    ]


def get_storage_options(
    queryset: QuerySet,
):
    """Build Storage Options."""

    queryset = (
        queryset
        .exclude(storage_gb__isnull=True)
        .exclude(storage_gb=0)
        .values("storage_gb")
        .annotate(count=Count("id"))
        .order_by("storage_gb")
    )

    return [
        {
            "value": item["storage_gb"],
            "label": f'{item["storage_gb"]} GB',
            "count": item["count"],
        }
        for item in queryset
    ]