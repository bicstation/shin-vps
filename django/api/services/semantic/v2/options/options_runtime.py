# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/v2/options/options_runtime.py

"""
Catalog Options Runtime

Responsibility:
- Runtime Contract を構築する
- Builder を呼び出す
- Runtime Metadata を付与する
"""

from .option_builder import build_options


def build_options_runtime():
    """
    Build Catalog Options Runtime.
    """

    return {
        "meaning": {
            "identity": "Catalog Options Runtime",
            "mission": "Catalog Toolbar が利用する選択肢を提供する",
        },
        "options": build_options(),
        "semantic_schema_version": 3,
        "authority_version": "2.0",
        "semantic_authority": "backend",
        "ready": True,
    }