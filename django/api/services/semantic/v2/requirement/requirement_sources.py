# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/services/semantic/v2/requirement/requirement_sources.py

"""
Requirement Source

Responsibility:
- Semantic AuthorityからPC Group Metadataを取得する
- Requirement RuntimeへPC対象Groupだけを提供する

No semantic interpretation.
No matching logic.
No scoring logic.
No Gemini processing.
"""

from api.services.semantic.v2.authority.tsv_loader import (
    load_all_tsvs,
)


PC_PARENT_GROUPS = {
    "gpu",
    "cpu",
    "memory",
    "storage",
    "usage",
    "device",
    "monitor",
    "maker",
}


# ==========================================================
# GROUP METADATA
# ==========================================================

def get_requirement_groups():

    registry = load_all_tsvs()

    groups = registry.get(
        "semantic_groups",
        []
    )

    return [
        group
        for group in groups
        if group.get(
            "parent_group"
        ) in PC_PARENT_GROUPS
    ]