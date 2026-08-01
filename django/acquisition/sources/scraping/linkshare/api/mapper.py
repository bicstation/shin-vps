#!/usr/bin/env python3
# ============================================================================
# SHIN CORE LINX
# LinkShare API Mapper Runtime
# ============================================================================

from __future__ import annotations

import json

from api.models.import_document import ImportDocument
from api.models.observation_document import ObservationDocument

from acquisition.registry.registry import (
    get_source,
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

        # --------------------------------------------------------------
        # Reality Source
        # --------------------------------------------------------------

        source = get_source(
            str(mid),
        )

        if source is None:

            raise RuntimeError(
                f"Reality Source Not Found : {mid}"
            )

        maker = source.get(
            "maker",
            "",
        )

        # --------------------------------------------------------------
        # Category
        # --------------------------------------------------------------

        category = observation.get(
            "category",
            "",
        )

        primary = ""
        secondary = ""

        if "~~" in category:

            primary, secondary = category.split(
                "~~",
                1,
            )

        else:

            primary = category

        # --------------------------------------------------------------
        # Price
        # --------------------------------------------------------------

        price = observation.get(
            "price",
            {},
        )

        sale_price = observation.get(
            "saleprice",
            {},
        )

        if isinstance(price, dict):

            retail_price = price.get(
                "value",
                "",
            )

            currency = price.get(
                "currency",
                "",
            )

        else:

            retail_price = price
            currency = ""

        if isinstance(sale_price, dict):

            sale_price = sale_price.get(
                "value",
                "",
            )

        price_value = (

            sale_price

            or retail_price

            or ""

        )

        # --------------------------------------------------------------
        # Release Date
        # --------------------------------------------------------------

        created_on = observation.get(
            "createdon",
            "",
        )

        release_date = (

            created_on[:10]

            if created_on

            else ""

        )

        # --------------------------------------------------------------
        # Import Contract
        # --------------------------------------------------------------

        return {

            "identity": {

                "sku": observation.get(
                    "sku",
                    "",
                ),

                "link_id": observation.get(
                    "linkid",
                    "",
                ),

                "maker": maker,

                "product_name": observation.get(
                    "productname",
                    "",
                ),

                "product_url": observation.get(
                    "producturl",
                    "",
                ),

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

            "description": observation.get(
                "description_long",
                "",
            ),

            "short_description": observation.get(
                "description_short",
                "",
            ),

            "category": {

                "primary": primary,

                "secondary": secondary,

                "keywords": observation.get(
                    "keywords",
                    "",
                ),

            },

            "commerce": {

                "price": price_value,

                "sale_price": sale_price,

                "retail_price": retail_price,

                "currency": currency,

                "availability": "",

                "release_date": release_date,

            },

            "affiliate": {

                "url": observation.get(
                    "linkurl",
                    "",
                ),

            },

            "media": {

                "image_url": observation.get(
                    "imageurl",
                    "",
                ),

                "images": [],

                "tables": [],

            },

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