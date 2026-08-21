# -*- coding: utf-8 -*-
# api/services/semantic/v2/intent/intent_sources.py

"""
Intent Source

Responsibility:
- intent_aliases.tsv を Intent Runtime へ提供する
- semantic_slug_metadata.tsv を Intent Runtime へ提供する

No semantic interpretation.
No matching logic.
No scoring logic.
"""

from api.services.semantic.v2.authority.tsv_loader import (
    load_all_tsvs,
)


# ==========================================================
# INTENT ALIASES
# ==========================================================

def get_intent_aliases():

    registry = (
        load_all_tsvs()
    )

    return registry.get(
        "intent_aliases",
        []
    )


# ==========================================================
# INTENT SLUG METADATA
# ==========================================================

def get_intent_slug_metadata():

    registry = (
        load_all_tsvs()
    )

    return registry.get(
        "semantic_slug_metadata",
        []
    )