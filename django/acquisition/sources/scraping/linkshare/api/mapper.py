#!/usr/bin/env python3
# ============================================================================
# SHIN CORE LINX
# LinkShare API Mapper Runtime
# ============================================================================

from __future__ import annotations

import json

from api.models.import_document import ImportDocument
from api.models.observation_document import ObservationDocument
from ..settings import (
    LINKSHARE_MID_MAP,
)



class LinkShareAPIMapperRuntime:
    """
    ==========================================================================
    LinkShare API Mapper Runtime
    ==========================================================================

    ObservationDocument
            ↓
    LinkShare API Import Contract
            ↓
    ImportDocument

    Responsibilities

    - Read ObservationDocument
    - Adapt Observation Runtime
    - Build LinkShare API Import Contract
    - Persist ImportDocument

    MUST NOT

    - Acquire
    - Formatter
    - Observation
    - Integration
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
        
        merchant = LINKSHARE_MID_MAP.get(
            str(mid),
            {},
        )

        #
        # --------------------------------------------------------------
        # Category
        # --------------------------------------------------------------
        #

        category = observation.get(
            "category",
            "",
        )

        primary = ""
        secondary = ""

        if "~~" in category:

            parts = category.split(
                "~~",
                1,
            )

            primary = parts[0]
            secondary = parts[1]

        else:

            primary = category

        #
        # --------------------------------------------------------------
        # Price
        # --------------------------------------------------------------
        #

        price = observation.get(
            "price",
            {},
        )

        sale_price = observation.get(
            "saleprice",
            {},
        )

        if isinstance(price, dict):

            retail_price_value = price.get(
                "value",
                "",
            )

            currency = price.get(
                "currency",
                "",
            )

        else:

            retail_price_value = price
            currency = ""

        if isinstance(sale_price, dict):

            sale_price_value = sale_price.get(
                "value",
                "",
            )

        else:

            sale_price_value = sale_price

        #
        # Prefer Sale Price
        #

        price_value = (

            sale_price_value

            or retail_price_value

            or ""

        )

        #
        # --------------------------------------------------------------
        # Release Date
        # --------------------------------------------------------------
        #

        created_on = observation.get(
            "createdon",
            "",
        )

        release_date = ""

        if created_on:

            #
            # ISO8601
            # 2026-06-24T15:31:21.000Z
            #      ↓
            # 2026-06-24
            #

            release_date = created_on[:10]

        #
        # --------------------------------------------------------------
        # Import Contract
        # --------------------------------------------------------------
        #

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
                    "linkid",
                    "",
                ),

                #
                # API Reality
                #

                "maker": merchant.get(
                    "maker",
                    "",
                ),

                "product_name": observation.get(
                    "productname",
                    "",
                ),

                "product_url": observation.get(
                    "producturl",
                    "",
                ),

                #
                # Not Provided by API
                #

                "brand": "",

                "manufacturer": "",

                "model": "",

                "product_no": "",

                "jan": observation.get(
                    "upccode",
                    "",
                ),

                "pc_id": "",

            },

            # ----------------------------------------------------------
            # Description
            # ----------------------------------------------------------

            "description": observation.get(
                "description_long",
                "",
            ),

            "short_description": observation.get(
                "description_short",
                "",
            ),

            # ----------------------------------------------------------
            # Category
            # ----------------------------------------------------------

            "category": {

                "primary": primary,

                "secondary": secondary,

                "keywords": observation.get(
                    "keywords",
                    "",
                ),

            },

            # ----------------------------------------------------------
            # Commerce
            # ----------------------------------------------------------

            "commerce": {

                "price": price_value,

                "sale_price": sale_price_value,

                "retail_price": retail_price_value,

                "currency": currency,

                "availability": "",

                "release_date": release_date,

            },

            # ----------------------------------------------------------
            # Affiliate
            # ----------------------------------------------------------

            "affiliate": {

                "url": observation.get(
                    "linkurl",
                    "",
                ),

            },

            # ----------------------------------------------------------
            # Media
            # ----------------------------------------------------------

            "media": {

                "image_url": observation.get(
                    "imageurl",
                    "",
                ),

                "images": [],

                "tables": [],

            },

            # ----------------------------------------------------------
            # Preserve Reality
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
    ) -> list[ImportDocument]:

        imports: list[ImportDocument] = []

        for document in documents:

            #
            # LinkShare Merchant
            #

            mid = document.observation.get(
                "mid",
                "",
            )

            contract = self.map(

                document.observation,

                mid=mid,

            )

            import_document, _ = ImportDocument.objects.update_or_create(

                source_name="linkshare",

                document_type="product",

                document_key=document.document_key,

                defaults={

                    "contract": contract,

                },

            )

            imports.append(
                import_document,
            )

        print(
            f"✅ IMPORT MAPPING : {len(imports):,}"
        )

        #
        # Contract Check
        #

        if imports:

            print()

            print("=" * 70)
            print("FIRST IMPORT CONTRACT")
            print("=" * 70)

            print(

                json.dumps(

                    imports[0].contract,

                    ensure_ascii=False,

                    indent=4,

                    sort_keys=False,

                )

            )

            print("=" * 70)

        return imports


# ============================================================================
# Runtime Entry Point
# ============================================================================

def main(
    *,
    documents: list[ObservationDocument],
) -> list[ImportDocument]:

    runtime = LinkShareAPIMapperRuntime()

    return runtime.run(
        documents=documents,
    )