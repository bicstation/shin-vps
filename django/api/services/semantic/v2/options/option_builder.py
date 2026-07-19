# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/v2/options/option_builder.py

"""
Catalog Options Builder

Responsibility:
- Runtime Contract を構築する
- Reality Source を Contract へ変換する
"""

from .option_sources import (
    get_cpu_options,
    get_gpu_options,
    get_maker_options,
    get_memory_options,
    get_storage_options,
)


def build_options():
    """
    Build Catalog Options Runtime Contract.
    """

    return {
        "maker": build_maker_options(),
        "cpu": build_cpu_options(),
        "gpu": build_gpu_options(),
        "memory": build_memory_options(),
        "storage": build_storage_options(),
    }


def build_maker_options():
    return get_maker_options()


def build_cpu_options():
    return get_cpu_options()


def build_gpu_options():
    return get_gpu_options()


def build_memory_options():
    return get_memory_options()


def build_storage_options():
    return get_storage_options()