#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/linkshare/api/acquire.py

SHIN CORE LINX
LinkShare API Acquire Runtime

Responsibilities

- Acquire LinkShare API Reality
- Preserve Raw XML Reality
- Persist AcquisitionDocument

NOT

- XML Parsing
- Formatter
- Observation
- Mapping
- Integration
- PCProduct
==============================================================================
"""

from __future__ import annotations

from api.models.acquisition_document import AcquisitionDocument

from .client import LinkShareAPIClient


class LinkShareAPIAcquireRuntime:
    """
    ==========================================================================
    LinkShare API Acquire Runtime
    ==========================================================================

    LinkShare API
            ↓
        Raw XML
            ↓
    AcquisitionDocument
    """

    def __init__(self) -> None:

        self.client = LinkShareAPIClient()

    # ------------------------------------------------------------------
    # Runtime
    # ------------------------------------------------------------------

    def run(
        self,
        *,
        mid: str,
        limit: int = 0,
    ) -> list[AcquisitionDocument]:

        pages = self.client.search_products(

            mid=mid,
            keyword=None,
            category=None,
            page_size=100,
            max_pages=0 if limit == 0 else limit,

        )

        if not pages:
            return []

        documents: list[AcquisitionDocument] = []

        for index, page in enumerate(
            pages,
            start=1,
        ):

            document, _ = AcquisitionDocument.objects.update_or_create(

                source_name="linkshare",
                document_type="product",
                document_key=f"{mid}_page_{index}",

                defaults={

                    "source_type": "api",
                    "source_url": page["url"],
                    "content_type": page["content_type"],
                    "content": page["content"],

                },

            )

            documents.append(
                document,
            )

        print(
            f"✅ ACQUIRED : {len(documents):,}"
        )

        return documents

    # ------------------------------------------------------------------
    # Advertiser List
    # ------------------------------------------------------------------
    
    def list_merchants(
        self,
        *,
        merchant_name: str | None = None,
    ) -> None:

        xml = self.client.search_advertisers(
            merchant_name=merchant_name,
        )

        print()
        print("=" * 70)
        print("LINKSHARE ADVERTISERS")
        print("=" * 70)
        print(xml)
        print("=" * 70)

# ============================================================================
# Runtime Entry Point
# ============================================================================

def main(
    *,
    mid: str,
    limit: int = 0,
) -> list[AcquisitionDocument]:

    runtime = LinkShareAPIAcquireRuntime()

    return runtime.run(

        mid=mid,
        limit=limit,

    )