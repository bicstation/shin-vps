# -*- coding: utf-8 -*-
"""
SHIN CORE LINX

Semantic Slug Metadata Authority

Responsibility

semantic_slug_metadata.tsv

↓

Slug Metadata Runtime

Only.

No presentation.
No business logic.
No workflow.
"""

from api.services.semantic.v2.authority.tsv_loader import (
    load_named_tsv,
)

# ==========================================================
# CACHE
# ==========================================================

_slug_metadata = None


# ==========================================================
# LOAD
# ==========================================================

def get_slug_metadata():

    global _slug_metadata

    if _slug_metadata is None:

        rows = load_named_tsv(
            "semantic_slug_metadata"
        )[3:]

        _slug_metadata = {
            row["slug"]: row
            for row in rows
        }

    return _slug_metadata


# ==========================================================
# LOOKUP
# ==========================================================

def get_slug(slug):

    return get_slug_metadata().get(slug)


# ==========================================================
# CLEAR CACHE
# ==========================================================

def clear_slug_metadata_cache():

    global _slug_metadata

    _slug_metadata = None