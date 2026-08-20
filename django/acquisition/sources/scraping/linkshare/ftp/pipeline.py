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
from .pc_filter import is_pc_target
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
        # PC Filter
        # ------------------------------------------------------

        pc_documents = [
            document
            for document in import_documents
            if is_pc_target(
                document,
                mid=mid,
            )
        ]

        # ------------------------------------------------------
        # Integration
        # ------------------------------------------------------

        integration(
            documents=pc_documents,
        )