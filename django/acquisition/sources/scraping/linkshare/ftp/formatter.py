#!/usr/bin/env python3
# ============================================================================
# SHIN CORE LINX
# LinkShare FTP Formatter Runtime
# ============================================================================

from __future__ import annotations

import csv
from io import StringIO

from api.models.acquisition_document import AcquisitionDocument


FIXED_DELIMITER = "|"


FIELD_MAPPING = {

    # ==========================================================
    # Identity
    # ==========================================================

    "C1": {
        "DB_FIELD": "link_id",
        "TYPE": "str",
    },

    "C2": {
        "DB_FIELD": "product_name",
        "TYPE": "str",
    },

    "C3": {
        "DB_FIELD": "sku",
        "TYPE": "str",
    },

    # ==========================================================
    # Category
    # ==========================================================

    "C4": {
        "DB_FIELD": "primary_category",
        "TYPE": "str",
    },

    "C5": {
        "DB_FIELD": "secondary_category",
        "TYPE": "str",
    },

    # ==========================================================
    # URLs
    # ==========================================================

    "C6": {
        "DB_FIELD": "buy_url",
        "TYPE": "str",
    },

    "C7": {
        "DB_FIELD": "image_url",
        "TYPE": "str",
    },

    "C8": {
        "DB_FIELD": "product_url",
        "TYPE": "str",
    },

    # ==========================================================
    # Content
    # ==========================================================

    "C9": {
        "DB_FIELD": "short_description",
        "TYPE": "str",
    },

    "C10": {
        "DB_FIELD": "description",
        "TYPE": "str",
    },

    # ==========================================================
    # Discount
    # ==========================================================

    "C11": {
        "DB_FIELD": "discount_value",
        "TYPE": "str",
    },

    "C12": {
        "DB_FIELD": "discount_type",
        "TYPE": "str",
    },

    # ==========================================================
    # Pricing
    # ==========================================================

    "C13": {
        "DB_FIELD": "sale_price",
        "TYPE": "Decimal",
    },

    "C14": {
        "DB_FIELD": "retail_price",
        "TYPE": "Decimal",
    },

    # ==========================================================
    # Date
    # ==========================================================

    "C15": {
        "DB_FIELD": "link_start_at",
        "TYPE": "str",
    },

    "C16": {
        "DB_FIELD": "link_end_at",
        "TYPE": "str",
    },

    # ==========================================================
    # Brand / Manufacturer
    # ==========================================================

    "C17": {
        "DB_FIELD": "brand_name",
        "TYPE": "str",
    },

    "C18": {
        "DB_FIELD": "shipping_cost",
        "TYPE": "str",
    },

    "C19": {
        "DB_FIELD": "keywords",
        "TYPE": "str",
    },

    "C20": {
        "DB_FIELD": "manufacturer_part_number",
        "TYPE": "str",
    },

    "C21": {
        "DB_FIELD": "manufacturer_name",
        "TYPE": "str",
    },

    # ==========================================================
    # Shipping
    # ==========================================================

    "C22": {
        "DB_FIELD": "shipping_information",
        "TYPE": "str",
    },

    "C23": {
        "DB_FIELD": "availability",
        "TYPE": "str",
    },

    # ==========================================================
    # Product Metadata
    # ==========================================================

    "C24": {
        "DB_FIELD": "upc",
        "TYPE": "str",
    },

    "C25": {
        "DB_FIELD": "attribute_code",
        "TYPE": "str",
    },

    "C26": {
        "DB_FIELD": "currency",
        "TYPE": "str",
    },

    "C27": {
        "DB_FIELD": "m1",
        "TYPE": "str",
    },

    "C28": {
        "DB_FIELD": "impression_url",
        "TYPE": "str",
    },

    # ==========================================================
    # Additional Attributes
    # ==========================================================

    "C29": {
        "DB_FIELD": "attribute_1",
        "TYPE": "str",
    },

    "C30": {
        "DB_FIELD": "attribute_2",
        "TYPE": "str",
    },

    "C31": {
        "DB_FIELD": "attribute_3",
        "TYPE": "str",
    },

    "C32": {
        "DB_FIELD": "attribute_4",
        "TYPE": "str",
    },

    "C33": {
        "DB_FIELD": "attribute_5",
        "TYPE": "str",
    },

    "C34": {
        "DB_FIELD": "attribute_6",
        "TYPE": "str",
    },

    "C35": {
        "DB_FIELD": "attribute_7",
        "TYPE": "str",
    },

    "C36": {
        "DB_FIELD": "attribute_8",
        "TYPE": "str",
    },

    "C37": {
        "DB_FIELD": "attribute_9",
        "TYPE": "str",
    },

    "C38": {
        "DB_FIELD": "attribute_10",
        "TYPE": "str",
    },

}


class LinkShareFTPFormatterRuntime:
    """
    LinkShare FTP Formatter Runtime

    Responsibilities

    - Read Acquisition Document
    - Normalize LinkShare TXT Records
    - Convert Columns to Runtime Fields

    MUST NOT

    - Observation
    - Mapping
    - Integration
    """

    # ------------------------------------------------------------------
    # Format One Row
    # ------------------------------------------------------------------

    def format_row(
        self,
        row: list[str],
    ) -> dict[str, str]:

        formatted: dict[str, str] = {}

        for index, value in enumerate(row):

            column = f"C{index + 1}"

            field_name = FIELD_MAPPING.get(
                column,
                {},
            ).get(
                "DB_FIELD",
                column,
            )

            formatted[field_name] = value.strip()

        return formatted

    # ------------------------------------------------------------------
    # Runtime
    # ------------------------------------------------------------------

    def run(
        self,
        *,
        document: AcquisitionDocument,
    ) -> list[dict[str, str]]:

        print(
            f"📄 FORMAT : {document.document_key}"
        )

        reader = csv.reader(
            StringIO(document.content),
            delimiter=FIXED_DELIMITER,
        )

        records: list[dict[str, str]] = []

        try:

            header = next(reader)

            if (
                not header
                or header[0] != "HDR"
            ):

                reader = csv.reader(
                    StringIO(document.content),
                    delimiter=FIXED_DELIMITER,
                )

        except StopIteration:

            return []

        for row in reader:

            if len(row) < 5:
                continue

            if row[0] == "TRL":
                continue

            records.append(
                self.format_row(row)
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
) -> list[dict[str, str]]:

    runtime = LinkShareFTPFormatterRuntime()

    return runtime.run(
        document=document,
    )