#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/linkshare/ftp/pc_filter.py

SHIN CORE LINX
LinkShare FTP PC Filter
==============================================================================
"""

from __future__ import annotations

from api.models.import_document import ImportDocument


# ==========================================================
# Constants
# ==========================================================

SOFMAP_MID = "37641"

PC_SECONDARY_CATEGORIES = {
    "パソコン本体~~ノートパソコン",
    "パソコン本体~~デスクトップパソコン",
}


# ==========================================================
# Filter
# ==========================================================

def is_pc_target(
    document: ImportDocument,
    *,
    mid: str,
) -> bool:
    """
    Determine whether an ImportDocument is a PC target.

    Current scope:
        Sofmap / mid=37641

    Eligible categories:
        - パソコン本体~~ノートパソコン
        - パソコン本体~~デスクトップパソコン
    """

    # ------------------------------------------------------
    # Sofmap only
    # ------------------------------------------------------

    if mid != SOFMAP_MID:
        return False

    # ------------------------------------------------------
    # Contract
    # ------------------------------------------------------

    contract = document.contract or {}

    observation = contract.get("observation") or {}

    # ------------------------------------------------------
    # Primary Category
    # ------------------------------------------------------

    if observation.get("primary_category") != "パソコン":
        return False

    # ------------------------------------------------------
    # Secondary Category
    # ------------------------------------------------------

    secondary_category = (
        observation.get("secondary_category") or ""
    )

    if secondary_category not in PC_SECONDARY_CATEGORIES:
        return False

    # ------------------------------------------------------
    # Eligible
    # ------------------------------------------------------

    return True