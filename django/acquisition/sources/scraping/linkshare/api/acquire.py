#!/usr/bin/env python3
"""
==============================================================================
LinkShare API Acquire Runtime
==============================================================================
"""

from __future__ import annotations

import xml.etree.ElementTree as ET

from api.models.acquisition_document import AcquisitionDocument

from .client import LinkShareAPIClient


class LinkShareAPIAcquireRuntime:

    def __init__(
        self,
    ) -> None:

        self.client = LinkShareAPIClient()

    # ------------------------------------------------------------------
    # Acquire
    # ------------------------------------------------------------------

    def run(
        self,
        *,
        mid: str,
        limit: int = 0,
    ) -> list[AcquisitionDocument]:

        pages = self.client.search_products(

            mid=mid,
            page_size=100,
            max_pages=0 if limit == 0 else limit,

        )

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

        root = ET.fromstring(
            xml,
        )

        print()
        print("=" * 90)
        print(
            f"{'MID':<8}"
            f"SITE"
        )
        print("=" * 90)

        total = 0

        for merchant in root.findall(".//merchant"):

            mid = (
                merchant.findtext("mid")
                or ""
            )

            site = (
                merchant.findtext("merchantname")
                or ""
            )

            print(
                f"{mid:<8}{site}"
            )

            total += 1

        print("=" * 90)
        print(
            f"TOTAL ADVERTISERS : {total:,}"
        )
        print("=" * 90)


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