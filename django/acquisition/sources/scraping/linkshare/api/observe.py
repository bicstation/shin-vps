#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/linkshare/api/observe.py

SHIN CORE LINX
LinkShare API Observation Runtime

Responsibilities

- Observe Formatter Runtime
- Preserve Observable Reality
- Persist ObservationDocument

NOT

- XML Parsing
- Classification
- Translation
- AI
- Semantic
- Import
- PCProduct
==============================================================================
"""

from __future__ import annotations

from typing import Any

from api.models.observation_document import ObservationDocument


class LinkShareAPIObservationRuntime:
    """
    ==========================================================================
    LinkShare API Observation Runtime
    ==========================================================================

    Formatter Runtime
            ↓
    Observation Runtime
            ↓
    ObservationDocument

    Reality is preserved exactly as observed.

    No classification.

    No semantic generation.
    """

    # ------------------------------------------------------------------
    # Observe One Record
    # ------------------------------------------------------------------

    def observe(
        self,
        record: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Observe a single formatter record.
        """

        return {

            # ----------------------------------------------------------
            # Identity
            # ----------------------------------------------------------

            "mid": record.get(
                "mid",
                "",
            ),

            "merchantname": record.get(
                "merchantname",
                "",
            ),

            "linkid": record.get(
                "linkid",
                "",
            ),

            "createdon": record.get(
                "createdon",
                "",
            ),

            "sku": record.get(
                "sku",
                "",
            ),

            # ----------------------------------------------------------
            # Product
            # ----------------------------------------------------------

            "productname": record.get(
                "productname",
                "",
            ),

            "category": record.get(
                "category",
                "",
            ),

            "upccode": record.get(
                "upccode",
                "",
            ),

            # ----------------------------------------------------------
            # Commerce
            # ----------------------------------------------------------

            "price": record.get(
                "price",
            ),

            "saleprice": record.get(
                "saleprice",
            ),

            # ----------------------------------------------------------
            # Description
            # ----------------------------------------------------------

            "description_short": record.get(
                "description_short",
                "",
            ),

            "description_long": record.get(
                "description_long",
                "",
            ),

            "keywords": record.get(
                "keywords",
                "",
            ),

            # ----------------------------------------------------------
            # Links
            # ----------------------------------------------------------

            "linkurl": record.get(
                "linkurl",
                "",
            ),

            "producturl": record.get(
                "producturl",
                "",
            ),

            "imageurl": record.get(
                "imageurl",
                "",
            ),

            # ----------------------------------------------------------
            # Reality
            # ----------------------------------------------------------

            "raw": record,

        }

    # ------------------------------------------------------------------
    # Runtime
    # ------------------------------------------------------------------

    def run(
        self,
        *,
        records: list[dict[str, Any]],
    ) -> list[ObservationDocument]:
        """
        Observe Formatter Runtime.
        """

        documents: list[ObservationDocument] = []

        for record in records:

            observation = self.observe(
                record,
            )

            document, _ = ObservationDocument.objects.update_or_create(

                source_name="linkshare",

                document_type="product",

                document_key=observation["linkid"],

                defaults={

                    "observation": observation,

                },

            )

            documents.append(
                document,
            )

        print(
            f"✅ OBSERVATION : {len(documents):,}"
        )

        return documents


# ============================================================================
# Runtime Entry Point
# ============================================================================

def main(
    *,
    records: list[dict[str, Any]],
) -> list[ObservationDocument]:
    """
    Execute LinkShare API Observation Runtime.
    """

    runtime = LinkShareAPIObservationRuntime()

    return runtime.run(
        records=records,
    )