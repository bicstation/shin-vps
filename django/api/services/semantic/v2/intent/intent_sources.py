# -*- coding: utf-8 -*-
# api/services/semantic/v2/intent/intent_sources.py

"""
Intent Alias Source

Responsibility:
- intent_aliases.tsv をIntent Runtimeへ提供する
- Semantic Authorityとは独立したIntent Dictionary Source

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