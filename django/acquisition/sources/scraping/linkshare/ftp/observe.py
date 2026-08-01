#!/usr/bin/env python3
# ============================================================================
# SHIN CORE LINX
# LinkShare FTP Observation Runtime
# ============================================================================

from __future__ import annotations

from api.models.observation_document import ObservationDocument


class LinkShareFTPObservationRuntime:
    """
    LinkShare FTP Observation Runtime

    Responsibilities

    - Observe Reality
    - Normalize Observation
    - Persist Observation Document

    MUST NOT

    - Formatter
    - Mapping
    - Integration
    - Semantic Analysis
    """

    # ------------------------------------------------------------------
    # Observe One Record
    # ------------------------------------------------------------------

    def observe(
        self,
        record: dict,
    ) -> dict:

        return {

            # ----------------------------------------------------------
            # Identity
            # ----------------------------------------------------------

            "sku": record.get(
                "sku",
                "",
            ),

            "link_id": record.get(
                "link_id",
                "",
            ),

            # ----------------------------------------------------------
            # Product
            # ----------------------------------------------------------

            "product_name": record.get(
                "product_name",
                "",
            ),

            "brand_name": record.get(
                "brand_name",
                "",
            ),

            "manufacturer_name": record.get(
                "manufacturer_name",
                "",
            ),

            "manufacturer_part_number": record.get(
                "manufacturer_part_number",
                "",
            ),

            # ----------------------------------------------------------
            # Category
            # ----------------------------------------------------------

            "primary_category": record.get(
                "primary_category",
                "",
            ),

            "secondary_category": record.get(
                "secondary_category",
                "",
            ),

            "keywords": record.get(
                "keywords",
                "",
            ),

            # ----------------------------------------------------------
            # Content
            # ----------------------------------------------------------

            "short_description": record.get(
                "short_description",
                "",
            ),

            "description": record.get(
                "description",
                "",
            ),

            # ----------------------------------------------------------
            # Assets
            # ----------------------------------------------------------

            "product_url": record.get(
                "product_url",
                "",
            ),

            "buy_url": record.get(
                "buy_url",
                "",
            ),

            "image_url": record.get(
                "image_url",
                "",
            ),

            # ----------------------------------------------------------
            # Commerce
            # ----------------------------------------------------------

            "sale_price": record.get(
                "sale_price",
                "",
            ),

            "retail_price": record.get(
                "retail_price",
                "",
            ),

            "currency": record.get(
                "currency",
                "",
            ),

            "availability": record.get(
                "availability",
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
        records: list[dict],
    ) -> list[ObservationDocument]:

        documents: list[ObservationDocument] = []

        for record in records:

            observation = self.observe(
                record,
            )

            document, _ = ObservationDocument.objects.update_or_create(

                source_name="linkshare",

                document_type="product",

                document_key=observation["link_id"],

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
    records: list[dict],
) -> list[ObservationDocument]:
    """
    Execute LinkShare FTP Observation Runtime.
    """

    runtime = LinkShareFTPObservationRuntime()

    return runtime.run(
        records=records,
    )