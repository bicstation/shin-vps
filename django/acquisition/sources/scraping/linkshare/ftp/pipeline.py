#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/linkshare/ftp/pipeline.py

SHIN CORE LINX
LinkShare FTP Acquisition Pipeline
==============================================================================
"""

from __future__ import annotations

from .acquire import main as acquire
from .formatter import main as formatter
from .observe import main as observe
from .mapper import main as mapper
from .integration import main as integration


# ==========================================================
# Pipeline
# ==========================================================

def main(
    *,
    mid: str,
) -> None:
    """
    Execute LinkShare FTP Acquisition Pipeline.
    """

    # ----------------------------------------------------------
    # Acquire
    # ----------------------------------------------------------

    acquire_documents = acquire(
        mid=mid,
    )

    # ----------------------------------------------------------
    # Process Acquisition Documents
    # ----------------------------------------------------------

    for acquire_document in acquire_documents:

        # ------------------------------------------------------
        # Formatter
        # ------------------------------------------------------

        formatted_records = formatter(
            document=acquire_document,
        )

        # ------------------------------------------------------
        # Observation
        # ------------------------------------------------------

        observation_documents = observe(
            records=formatted_records,
        )

        # ------------------------------------------------------
        # Mapping
        # ------------------------------------------------------

        import_documents = mapper(
            documents=observation_documents,
            mid=mid,
        )

        # ------------------------------------------------------
        # Integration
        # ------------------------------------------------------

        integration(
            documents=import_documents,
        )