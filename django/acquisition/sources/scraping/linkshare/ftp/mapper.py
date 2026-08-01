#!/usr/bin/env python3
# ============================================================================
# SHIN CORE LINX
# LinkShare FTP Mapping Runtime
# ============================================================================

from __future__ import annotations

from api.models.observation_document import ObservationDocument
from api.models.import_document import ImportDocument

from acquisition.registry.registry import (
    get_source,
)

class LinkShareFTPMappingRuntime:
    """
    LinkShare FTP Mapping Runtime

    Responsibilities

    - Read Observation Document
    - Translate Observation Contract
    - Build Import Contract
    - Persist Import Document

    MUST NOT

    - AI
    - Semantic
    - PCProduct
    """

    # ------------------------------------------------------------------
    # Map One Observation
    # ------------------------------------------------------------------

    def map(
        self,
        observation: dict,
        *,
        mid: str,
    ) -> dict:

        merchant = get_source(mid)
        maker = merchant["maker"]
        
        return {

            # ----------------------------------------------------------
            # Identity
            # ----------------------------------------------------------

            "identity": {

                "sku": observation.get(
                    "sku",
                    "",
                ),

                "link_id": observation.get(
                    "link_id",
                    "",
                ),

                "maker": merchant.get(
                    "maker",
                    "",
                ),
                

                "product_name": observation.get(
                    "product_name",
                    "",
                ),

                "product_url": observation.get(
                    "product_url",
                    "",
                ),

                "brand": observation.get(
                    "brand_name",
                    "",
                ),

                "manufacturer": observation.get(
                    "manufacturer_name",
                    "",
                ),

                "model": "",

                "product_no": observation.get(
                    "manufacturer_part_number",
                    "",
                ),

            },

            # ----------------------------------------------------------
            # Description
            # ----------------------------------------------------------

            "description": observation.get(
                "description",
                "",
            ),

            "short_description": observation.get(
                "short_description",
                "",
            ),
            
            # ----------------------------------------------------------
            # Category
            # ----------------------------------------------------------

            "category": {

                "primary": observation.get(
                    "primary_category",
                    "",
                ),

                "secondary": observation.get(
                    "secondary_category",
                    "",
                ),

                "keywords": observation.get(
                    "keywords",
                    "",
                ),

            },


            # ----------------------------------------------------------
            # Commerce
            # ----------------------------------------------------------

            "commerce": {

                "price": (
                    observation.get("sale_price")
                    or observation.get("retail_price")
                    or 0
                ),

                "sale_price": observation.get(
                    "sale_price",
                    "",
                ),

                "retail_price": observation.get(
                    "retail_price",
                    "",
                ),

                "currency": observation.get(
                    "currency",
                    "",
                ),

                "availability": observation.get(
                    "availability",
                    "",
                ),

                "release_date": "",

            },

            # ----------------------------------------------------------
            # Affiliate
            # ----------------------------------------------------------

            "affiliate": {

                "url": observation.get(
                    "buy_url",
                    "",
                ),

            },

            # ----------------------------------------------------------
            # Media
            # ----------------------------------------------------------

            "media": {

                "image_url": observation.get(
                    "image_url",
                    "",
                ),

                "images": [],

                "tables": [],

            },

            # ----------------------------------------------------------
            # Preserve Observation
            # ----------------------------------------------------------

            "observation": observation,

        }

    # ------------------------------------------------------------------
    # Runtime
    # ------------------------------------------------------------------

    def run(
        self,
        *,
        documents: list[ObservationDocument],
        mid: str,
    ) -> list[ImportDocument]:

        imports: list[ImportDocument] = []

        for document in documents:

            contract = self.map(
                document.observation,
                mid=mid,
            )

            import_document, _ = ImportDocument.objects.update_or_create(

                source_name=document.source_name,

                document_type=document.document_type,

                document_key=document.document_key,

                defaults={
                    "contract": contract,
                },

            )

            imports.append(
                import_document,
            )

        print(
            f"✅ IMPORT CONTRACT : {len(imports):,}"
        )

        return imports


# ============================================================================
# Runtime Entry Point
# ============================================================================

def main(
    *,
    documents: list[ObservationDocument],
    mid: str,
) -> list[ImportDocument]:
    """
    Execute LinkShare FTP Mapping Runtime.
    """

    runtime = LinkShareFTPMappingRuntime()

    return runtime.run(
        documents=documents,
        mid=mid,
    )