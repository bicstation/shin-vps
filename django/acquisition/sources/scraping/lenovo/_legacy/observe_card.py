#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/frontier/observe_card.py

SHIN CORE LINX

FRONTIER Card Observation Runtime

Reality First Pipeline

AcquisitionDocument(Card)
        │
        ▼
Observe Product Card
        │
        ▼
Observation

Reality First
Observation First

Responsibilities

- Observe Product Card
- Observe Published Reality
- Produce Product Observation

NOT Responsibilities

- Formatter
- Runtime Contract
- Mapper
- Semantic
- Product Integration

==============================================================================
"""

from __future__ import annotations

from bs4 import BeautifulSoup

from api.models import (
    AcquisitionDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from ..settings import (
    BASE_URL,
    SOURCE_NAME,
    SITE_NAME,
)


# ==============================================================================
# Helpers
# ==============================================================================

def absolute_url(
    href: str,
) -> str:
    """
    Convert relative URL into absolute URL.
    """

    if not href:
        return ""

    if href.startswith("/"):
        return BASE_URL + href

    return href


def text(
    element,
) -> str:
    """
    Safe text extraction.
    """

    if element is None:
        return ""

    return element.get_text(
        strip=True,
    )
    
# ==============================================================================
# Product Observation
# ==============================================================================

def observe_product(
    card,
) -> dict:
    """
    Observe Product Reality.
    """

    #
    # Product Code
    #

    product_code = text(

        card.select_one(

            "h3.uk-card-title"

        )

    )

    #
    # Product URL
    #

    detail = card.select_one(

        'a[href*="/direct/g/"]'

    )

    product_url = ""

    if detail is not None:

        product_url = absolute_url(

            detail.get(

                "href",

                "",

            )

        )

    #
    # Image
    #

    image = card.select_one(

        "figure img"

    )

    image_url = ""

    if image is not None:

        image_url = absolute_url(

            image.get(

                "data-src",

                image.get(

                    "src",

                    "",

                ),

            )

        )

    #
    # Price
    #

    price = text(

        card.select_one(

            "div.iw-price-default"

        )

    )

    #
    # Specifications
    #

    specifications = []

    for item in card.select(

        "div.iw-goods-comment-1 li"

    ):

        value = text(

            item,

        )

        if value:

            specifications.append(

                value,

            )

    return {

        "product_code": product_code,

        "product_url": product_url,

        "image_url": image_url,

        "price": price,

        "specifications": specifications,

    }

# ==============================================================================
# Runtime
# ==============================================================================

def observe():

    trace_pipeline(
        "CARD OBSERVATION",
    )

    print("=" * 70)
    print(f"{SITE_NAME} CARD OBSERVATION")
    print("=" * 70)

    observations = []

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_type="scraping",

            source_name=SOURCE_NAME,

            document_type="card",

        )

        .order_by(

            "document_key",

        )

        .iterator()

    )

    for document in documents:

        print()

        print(
            f"Card : {document.document_key}"
        )

        soup = BeautifulSoup(

            document.content,

            "html.parser",

        )

        cards = soup.select(

            "div.uk-card.uk-card-small.uk-card-default.iw-goods"

        )

        print(
            f"Products : {len(cards)}"
        )

        for card in cards:

            observation = observe_product(

                card,

            )

            observations.append(

                observation,

            )

            print(
                f'  {observation["product_code"]}'
            )

    print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"Observed : {len(observations)}")
    print("=" * 70)

    return observations

# ==============================================================================
# Entry Point
# ==============================================================================

def main():
    """
    Runtime Entry Point.
    """

    observe()


if __name__ == "__main__":

    main()