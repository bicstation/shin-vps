# /home/maya/shin-dev/shin-vps/django/acquisition/sources/scraping/linkshare/api/formatter.py
#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/linkshare/api/formatter.py

SHIN CORE LINX
LinkShare API Formatter Runtime

Responsibilities

- Read AcquisitionDocument
- Parse XML Reality
- Convert XML to Runtime Records

NOT

- Observation
- Mapping
- Integration
- AI
- Semantic
- PCProduct
==============================================================================
"""

from __future__ import annotations

from urllib.parse import parse_qs, urlparse
from xml.etree import ElementTree as ET

from api.models.acquisition_document import AcquisitionDocument


class LinkShareAPIFormatterRuntime:
    """
    ==========================================================================
    LinkShare API Formatter Runtime
    ==========================================================================

    AcquisitionDocument
            ↓
        XML Parse
            ↓
      Product Runtime
    """

    # ------------------------------------------------------------------
    # URL
    # ------------------------------------------------------------------

    def extract_product_url(
        self,
        affiliate_url: str,
    ) -> str:

        if not affiliate_url:
            return ""

        query = parse_qs(
            urlparse(affiliate_url).query
        )

        return query.get(
            "murl",
            [""],
        )[0]

    # ------------------------------------------------------------------
    # Format One Item
    # ------------------------------------------------------------------

    def format_item(
        self,
        item: ET.Element,
    ) -> dict:

        category = item.find("category")

        primary = ""
        secondary = ""

        if category is not None:

            primary = category.findtext(
                "primary",
                "",
            )

            secondary = category.findtext(
                "secondary",
                "",
            )

        description = item.find("description")

        short = ""
        long = ""

        if description is not None:

            short = description.findtext(
                "short",
                "",
            )

            long = description.findtext(
                "long",
                "",
            )

        price = item.find("price")
        sale = item.find("saleprice")

        affiliate_url = item.findtext(
            "linkurl",
            "",
        )

        return {

            # ----------------------------------------------------------
            # Identity
            # ----------------------------------------------------------

            "mid": item.findtext("mid", ""),

            "merchantname": item.findtext(
                "merchantname",
                "",
            ),

            "linkid": item.findtext(
                "linkid",
                "",
            ),

            "createdon": item.findtext(
                "createdon",
                "",
            ),

            "sku": item.findtext(
                "sku",
                "",
            ),

            # ----------------------------------------------------------
            # Product
            # ----------------------------------------------------------

            "productname": item.findtext(
                "productname",
                "",
            ),

            "category": f"{primary}~~{secondary}".strip("~~"),

            "upccode": item.findtext(
                "upccode",
                "",
            ),

            # ----------------------------------------------------------
            # Commerce
            # ----------------------------------------------------------

            "price": {

                "value": (
                    price.text
                    if price is not None
                    else ""
                ),

                "currency": (
                    price.get("currency")
                    if price is not None
                    else ""
                ),

            },

            "saleprice": {

                "value": (
                    sale.text
                    if sale is not None
                    else ""
                ),

                "currency": (
                    sale.get("currency")
                    if sale is not None
                    else ""
                ),

            },

            # ----------------------------------------------------------
            # Description
            # ----------------------------------------------------------

            "description_short": short,

            "description_long": long,

            "keywords": item.findtext(
                "keywords",
                "",
            ),

            # ----------------------------------------------------------
            # Links
            # ----------------------------------------------------------

            "linkurl": affiliate_url,

            "producturl": self.extract_product_url(
                affiliate_url,
            ),

            "imageurl": item.findtext(
                "imageurl",
                "",
            ),

        }

    # ------------------------------------------------------------------
    # Runtime
    # ------------------------------------------------------------------

    def run(
        self,
        *,
        document: AcquisitionDocument,
    ) -> list[dict]:

        print(
            f"📄 FORMAT : {document.document_key}"
        )

        root = ET.fromstring(
            document.content,
        )

        records: list[dict] = []

        for item in root.findall(".//item"):

            records.append(

                self.format_item(
                    item,
                )

            )

        print(
            f"✅ FORMATTED : {len(records):,}"
        )

        return records


# ============================================================================
# Runtime Entry Point
# ============================================================================

def main(
    *,
    document: AcquisitionDocument,
) -> list[dict]:

    runtime = LinkShareAPIFormatterRuntime()

    return runtime.run(
        document=document,
    )