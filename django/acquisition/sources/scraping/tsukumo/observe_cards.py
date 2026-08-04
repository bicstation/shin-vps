#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

TSUKUMO Card Observation

Observation Runtime

AcquisitionDocument (cards)
        │
        ▼
Card HTML
        │
        ▼
Observation Runtime

Reality First
Observation First

Responsibilities

- Observe Published Product Cards
- Observe Published Reality
- Produce Observation Runtime

Not Responsibilities

- Formatter
- Mapper
- Semantic
- AI
- Product Integration
==============================================================================
"""

from __future__ import annotations

import json

from bs4 import BeautifulSoup

from api.models.acquisition_document import (
    AcquisitionDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    SITE_NAME,
)

# ==============================================================================
# HTML Helper
# ==============================================================================

def select_text(
    soup: BeautifulSoup,
    selector: str,
) -> str:
    """
    Extract text from selector.
    """

    element = soup.select_one(
        selector,
    )

    if not element:
        return ""

    return element.get_text(
        strip=True,
    )


def select_attr(
    soup: BeautifulSoup,
    selector: str,
    attribute: str,
) -> str:
    """
    Extract attribute from selector.
    """

    element = soup.select_one(
        selector,
    )

    if not element:
        return ""

    return element.get(
        attribute,
        "",
    )


def select_meta(
    soup: BeautifulSoup,
    itemprop: str,
) -> str:
    """
    Extract Schema.org meta.
    """

    element = soup.select_one(

        f'meta[itemprop="{itemprop}"]'

    )

    if not element:
        return ""

    return element.get(
        "content",
        "",
    )
    

# ==============================================================================
# Product Observation
# ==============================================================================

def observe_card(
    *,
    document_key: str,
    card_html: str,
) -> dict:
    
    print("=" * 60)
    print(card_html[:500])
    print("=" * 60)
    

    soup = BeautifulSoup(

        card_html,

        "html.parser",

    )

    # ------------------------------------------------------------------
    # Product
    # ------------------------------------------------------------------

    raw_title = select_meta(

        soup,

        "name",

    )

    raw_description = select_meta(

        soup,

        "description",

    )

    raw_sku = select_meta(

        soup,

        "sku",

    )

    # ------------------------------------------------------------------
    # Maker
    # ------------------------------------------------------------------

    raw_maker = select_text(

        soup,

        "a.no_margin",

    )

    # ------------------------------------------------------------------
    # Detail URL
    # ------------------------------------------------------------------
    
    raw_detail_url = select_attr(

        soup,

        "a.product-link",

        "href",

    )

    #
    # Fallback
    #

    if not raw_detail_url:

        raw_detail_url = select_attr(

            soup,

            "a[href*='/goods/']",

            "href",

        )
    
    # ------------------------------------------------------------------
    # Commerce
    # ------------------------------------------------------------------

    raw_price = select_text(

        soup,

        ".search-box__price .text-red__common",

    )

    #
    # Fallback
    #

    if not raw_price:

        raw_price = select_meta(

            soup,

            "price",

        )

    raw_availability = select_meta(

        soup,

        "availability",

    )

    # ------------------------------------------------------------------
    # Media
    # ------------------------------------------------------------------
    
    raw_image = select_attr(

        soup,

        "a.product-link img",

        "src",

    )

    #
    # Fallback
    #

    if not raw_image:

        raw_image = select_meta(

            soup,

            "image",

        )   

    # ------------------------------------------------------------------
    # Labels
    # ------------------------------------------------------------------
    
    raw_labels = [

        label.get_text(

            strip=True,

        )

        for label in soup.select(

            ".label_space span"

        )

    ]

    # ------------------------------------------------------------------
    # Specifications
    # ------------------------------------------------------------------

    raw_specs = [

        spec.get_text(

            " ",

            strip=True,

        )

        for spec in soup.select(

            "li"

        )

        if spec.get_text(

            strip=True,

        )

    ]
    
    raw_stock = select_text(

        soup,

        ".search_stock_title span",

    )

    raw_shipping = select_text(

        soup,

        ".tommorow_deliv",

    )
    
    raw_summary = select_text(

        soup,

        'div[itemtype="http://schema.org/Product"] + div p',

    )
    
    # ------------------------------------------------------------------
    # Category
    # ------------------------------------------------------------------

    category = ""

    # ------------------------------------------------------------------
    # Observation Runtime
    # ------------------------------------------------------------------
    
    observation = {

        "document_key": document_key,

        #
        # Category
        #

        "category": category,

        #
        # Product
        #

        "raw_title": raw_title,
        "raw_description": raw_description,
        "raw_summary": raw_summary,
        "raw_maker": raw_maker,
        "raw_sku": raw_sku,

        #
        # Commerce
        #

        "raw_price": raw_price,
        "raw_stock": raw_stock,
        "raw_availability": raw_availability,
        "raw_shipping": raw_shipping,

        #
        # Media
        #

        "raw_image": raw_image,
        "raw_detail_url": raw_detail_url,

        #
        # Observation
        #

        "raw_specs": raw_specs,
        "raw_labels": raw_labels,

        #
        # Reality
        #

        "raw_html": card_html,

    }


    return observation   


# ==============================================================================
# Runtime
# ==============================================================================

DOCUMENT_INPUT = "cards"

DOCUMENT_OUTPUT = "observation"

# ==============================================================================
# Observation Contract
# ==============================================================================

CARD_FIELDS = (

    "document_key",

    #
    # Category
    #

    "category",

    #
    # Product
    #

    "raw_title",
    "raw_description",
    "raw_maker",
    "raw_sku",

    #
    # Commerce
    #

    "raw_price",
    "raw_stock",
    "raw_availability",
    "raw_shipping",

    #
    # Media
    #

    "raw_image",
    "raw_detail_url",

    #
    # Observation
    #

    "raw_specs",
    "raw_labels",

    #
    # Reality
    #

    "raw_html",

)


# ==============================================================================
# Cache
# ==============================================================================

def save_observation(
    *,
    document_key: str,
    observation: dict,
):

    document, created = AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_OUTPUT,

        document_key=document_key,

        defaults={

            "content_type": "application/json",

            "content": json.dumps(

                observation,

                ensure_ascii=False,

                indent=2,

            ),

        },

    )

    return document, created

# ==============================================================================
# Runtime
# ==============================================================================

def observe(
    *,
    force: bool = False,
) -> None:

    trace_pipeline(
        "CARD OBSERVATION",
    )

    print("=" * 70)
    print(f"👀 {SITE_NAME} CARD OBSERVATION")
    print("=" * 70)

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_type="scraping",

            source_name=SITE_NAME.lower(),

            document_type=DOCUMENT_INPUT,

        )

        .order_by(

            "document_key",

        )

    )

    success: list[str] = []

    failed: list[tuple[str, str]] = []

    for document in documents:

        document_key = document.document_key

        print(document_key)

        runtime = json.loads(

            document.content,

        )

        cards = runtime.get(

            "cards",

            [],

        )

        observations = []

        try:

            for card in cards:

                observation = observe_card(

                    document_key=document_key,

                    card_html=card["html"],

                )

                observations.append(

                    observation,

                )
                
            _, created = save_observation(

                document_key=document_key,

                observation={

                    "document_key": document_key,

                    "cards": observations,

                },

            )

            success.append(

                document_key,

            )

            print(

                f"  Cards : {len(observations)}"

            )

            print(

                f"  Saved : {'CREATED' if created else 'UPDATED'}"

            )

        except Exception as e:

            failed.append(

                (

                    document_key,

                    str(e),

                )

            )

            print(

                "  Status : ERROR"

            )

            print(

                f"  Reason : {e}"

            )

        print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"SUCCESS : {len(success)}")
    print(f"FAILED  : {len(failed)}")
    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    **kwargs,
) -> None:

    observe(

        force=kwargs.get(

            "force",

            False,

        ),

    )


if __name__ == "__main__":

    main()