# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/v2/options/option_sources.py

"""
Catalog Option Sources

Responsibility:
- Reality Source から Option を取得する
- QuerySet を Option Contract へ変換する
"""

from django.db.models import Count

from api.models import PCProduct


def get_maker_options():
    """Build Maker Options."""

    queryset = (
        PCProduct.objects
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


def get_cpu_options():
    """Build CPU Options."""

    queryset = (
        PCProduct.objects
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


def get_gpu_options():
    """Build GPU Options."""

    queryset = (
        PCProduct.objects
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


def get_memory_options():
    """Build Memory Options."""

    queryset = (
        PCProduct.objects
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


def get_storage_options():
    """Build Storage Options."""

    queryset = (
        PCProduct.objects
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