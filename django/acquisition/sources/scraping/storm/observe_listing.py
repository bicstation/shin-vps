#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/storm/observe_listing.py

SHIN CORE LINX

STORM Listing Observation Runtime

Reality First
Observation First

Listing HTML
│
▼
Product Card (<li>)
│
├── Product Detail URL
├── Product Name
├── Specification
├── Price
├── Stock Status
└── Image URL
│
▼
Observed Product Reality
│
▼
AcquisitionDocument(card)

Responsibilities

- Read Listing HTML
- Discover Product Cards
- Observe published Product Detail URL
- Observe published Product Name
- Observe published Specification
- Observe published Price
- Observe published Stock Status
- Observe published Image URL
- Preserve observed Reality
- Produce Card AcquisitionDocument

NOT Responsibilities

- Individual Product Page Acquisition
- Semantic Classification
- Runtime Contract
- Formatter
- Mapper
- Product Building
- Semantic Processing

IMPORTANT

STORM listing pages already contain the required Product Card Reality.

Therefore:

    Listing HTML
        ↓
    Card Observation
        ↓
    Observed Reality
        ↓
    AcquisitionDocument(card)

No individual Product Detail HTTP request is performed here.

The persisted card content is JSON Reality.

The Formatter must NOT parse HTML.
==============================================================================
"""

from __future__ import annotations


import json


from bs4 import BeautifulSoup


from api.models import (
    AcquisitionDocument,
)


from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)


from .settings import (
    BASE_URL,
    SOURCE_NAME,
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

    href = href.strip()

    if not href:
        return ""

    if href.startswith("//"):
        return f"https:{href}"

    if href.startswith("/"):
        return BASE_URL + href

    return href


def clean_text(
    value: str | None,
) -> str:
    """
    Normalize structural whitespace only.

    No semantic interpretation.
    No field extraction.
    No translation.
    """

    if not value:
        return ""

    return " ".join(
        value.split()
    ).strip()


def document_key(
    url: str,
) -> str:
    """
    Create document key from Product Detail URL.
    """

    return (
        url
        .rstrip("/")
        .split("/")
        [-1]
    )


# ==============================================================================
# Product Detail URL Observation
# ==============================================================================


def observe_product_url(
    card,
) -> str:
    """
    Observe published Product Detail URL
    from one Product Card.

    STORM provides multiple actions inside a card.

    Cart
        → ignored

    商品詳細＆カスタマイズ
        → Product Detail URL
        → selected
    """

    links = card.select(
        "a.product-list-btn-detail[href]"
    )

    for link in links:

        href = link.get(
            "href",
            "",
        )

        url = absolute_url(
            href,
        )

        if not url:
            continue

        if "/products/detail/" not in url:
            continue

        return url

    return ""


# ==============================================================================
# Product Name Observation
# ==============================================================================


def observe_product_name(
    card,
) -> str:
    """
    Observe published Product Name.
    """

    element = card.select_one(
        ".product-list-title"
    )

    if not element:
        return ""

    return clean_text(
        element.get_text(
            " ",
            strip=True,
        )
    )


# ==============================================================================
# Specification Observation
# ==============================================================================


def observe_specification(
    card,
) -> str:
    """
    Observe published Product Specification.

    Example Reality:

        AMD Ryzen 7 7800X3D
        DDR5メモリ 16GB
        RTX 5060Ti 8GB
        NVMeSSD 1TB
        Windows11 Home 64bit

    No CPU/GPU/RAM/SSD semantic extraction occurs here.
    """

    element = card.select_one(
        ".product-list-spec"
    )

    if not element:
        return ""

    return clean_text(
        element.get_text(
            " ",
            strip=True,
        )
    )


# ==============================================================================
# Price Observation
# ==============================================================================


def observe_price(
    card,
) -> str:
    """
    Observe published Sales Price.

    Reality is preserved as published text.
    """

    element = card.select_one(
        ".product-list-sales-price"
    )

    if not element:
        return ""

    return clean_text(
        element.get_text(
            " ",
            strip=True,
        )
    )


# ==============================================================================
# Stock Observation
# ==============================================================================


def observe_stock_status(
    card,
) -> str:
    """
    Observe published Stock / Purchase Status.

    No availability interpretation is performed.

    Examples:

        ただいま品切れ中です。

        Cart item structures
        標準構成で注文する
    """

    element = card.select_one(
        ".product-list-add-cart"
    )

    if not element:
        return ""

    return clean_text(
        element.get_text(
            " ",
            strip=True,
        )
    )


# ==============================================================================
# Image Observation
# ==============================================================================


def observe_image_url(
    card,
) -> str:
    """
    Observe published Product Image URL.
    """

    element = card.select_one(
        "img[src]"
    )

    if not element:
        return ""

    src = element.get(
        "src",
        "",
    )

    return absolute_url(
        src,
    )


# ==============================================================================
# Card Observation
# ==============================================================================


def observe_card(
    card,
) -> dict:
    """
    Observe one Product Card.

    Returns published Card Reality only.

    No semantic classification.
    No runtime mapping.
    No product building.
    """

    product_url = observe_product_url(
        card,
    )

    product_name = observe_product_name(
        card,
    )

    specification = observe_specification(
        card,
    )

    price = observe_price(
        card,
    )

    stock_status = observe_stock_status(
        card,
    )

    image_url = observe_image_url(
        card,
    )

    return {

        "product_url": product_url,

        "product_name": product_name,

        "specification": specification,

        "price": price,

        "stock_status": stock_status,

        "image_url": image_url,

    }


# ==============================================================================
# Card Discovery
# ==============================================================================


def discover_cards(
    html: str,
):
    """
    Discover Product Cards from Listing HTML.

    STORM product cards are represented by <li> elements.

    A Product Card is identified by the presence of:

        .product-list-title

    This intentionally avoids depending on the full
    visual/card class hierarchy.
    """

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    cards = soup.select(
        "li:has(.product-list-title)"
    )

    return cards


# ==============================================================================
# Persistence
# ==============================================================================


def save_card_document(
    *,
    observation: dict,
) -> tuple[AcquisitionDocument, bool]:
    """
    Persist observed Product Card Reality.

    IMPORTANT

    The content stored here is JSON Reality.

    The original Listing HTML is NOT stored here.

    The Product Detail page is NOT requested.
    """

    url = observation.get(
        "product_url",
        "",
    )

    key = document_key(
        url,
    )

    if not key:

        raise RuntimeError(
            "Unable to create document key "
            f"from Product URL: {url}"
        )

    content = json.dumps(
        observation,
        ensure_ascii=False,
        separators=(
            ",",
            ":",
        ),
    )

    return (
        AcquisitionDocument.objects.update_or_create(

            source_type="scraping",

            source_name=SOURCE_NAME,

            document_type="card",

            document_key=key,

            defaults={

                "source_url": url,

                "content_type": (
                    "application/json; "
                    "source=listing-observation"
                ),

                "content": content,

            },

        )
    )


# ==============================================================================
# Observation Runtime
# ==============================================================================


def observe_listing() -> None:
    """
    Execute STORM Listing Observation Runtime.

    Pipeline:

        Listing AcquisitionDocument(seed)
                    ↓
              Listing HTML
                    ↓
              Product Cards
                    ↓
             Card Observation
                    ↓
          AcquisitionDocument(card)
    """

    trace_pipeline(
        "LISTING OBSERVATION",
    )

    print()

    print(
        "=" * 70
    )

    print(
        "STORM LISTING OBSERVATION"
    )

    print(
        "=" * 70
    )

    created_count = 0

    updated_count = 0

    skipped_count = 0

    document_count = 0

    card_count = 0

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_type="scraping",

            source_name=SOURCE_NAME,

            document_type="seed",

        )

        .exclude(

            content="",

        )

        .order_by(
            "document_key",
        )

        .iterator()

    )

    seen: set[str] = set()

    # ==========================================================================
    # Listing Documents
    # ==========================================================================

    for document in documents:

        document_count += 1

        print()

        print(
            "=" * 70
        )

        print(
            f"SEED : {document.document_key}"
        )

        print(
            f"URL  : {document.source_url}"
        )

        print(
            "=" * 70
        )

        cards = discover_cards(
            document.content,
        )

        print(
            f"CARDS : {len(cards)}"
        )

        # ======================================================================
        # Product Cards
        # ======================================================================

        for index, card in enumerate(
            cards,
            start=1,
        ):

            card_count += 1

            try:

                # ----------------------------------------------------------------
                # Observe Reality
                # ----------------------------------------------------------------

                observation = observe_card(
                    card,
                )

                product_url = observation.get(
                    "product_url",
                    "",
                )

                # ----------------------------------------------------------------
                # Product Detail URL is mandatory
                # ----------------------------------------------------------------

                if not product_url:

                    skipped_count += 1

                    print(
                        f"SKIP [{index:>3}] "
                        "Product Detail URL not found"
                    )

                    continue

                # ----------------------------------------------------------------
                # Duplicate Protection
                # ----------------------------------------------------------------

                if product_url in seen:

                    skipped_count += 1

                    print(
                        f"SKIP [{index:>3}] "
                        f"{product_url}"
                    )

                    continue

                seen.add(
                    product_url
                )

                # ----------------------------------------------------------------
                # Persist Observed Reality
                # ----------------------------------------------------------------

                card_document, created = (
                    save_card_document(
                        observation=observation,
                    )
                )

                if created:

                    created_count += 1

                    status = "CREATE"

                else:

                    updated_count += 1

                    status = "UPDATE"

                # ----------------------------------------------------------------
                # Observation Output
                # ----------------------------------------------------------------

                print(
                    f"{status} [{index:>3}] "
                    f"{card_document.document_key}"
                )

                print(
                    f"  URL   : "
                    f"{observation['product_url']}"
                )

                print(
                    f"  NAME  : "
                    f"{observation['product_name']}"
                )

                print(
                    f"  SPEC  : "
                    f"{observation['specification']}"
                )

                print(
                    f"  PRICE : "
                    f"{observation['price']}"
                )

                print(
                    f"  STOCK : "
                    f"{observation['stock_status']}"
                )

                print(
                    f"  IMAGE : "
                    f"{observation['image_url']}"
                )

            except Exception as e:

                skipped_count += 1

                print(
                    f"ERROR [{index:>3}]"
                )

                print(
                    f"        {e}"
                )

    # ==========================================================================
    # Result
    # ==========================================================================

    print()

    print(
        "=" * 70
    )

    print(
        "RESULT"
    )

    print(
        "=" * 70
    )

    print(
        f"SEEDS   : {document_count}"
    )

    print(
        f"CARDS   : {card_count}"
    )

    print(
        f"CREATED : {created_count}"
    )

    print(
        f"UPDATED : {updated_count}"
    )

    print(
        f"SKIPPED : {skipped_count}"
    )

    print(
        f"OBSERVED: "
        f"{created_count + updated_count}"
    )

    print(
        "=" * 70
    )


# ==============================================================================
# Entry Point
# ==============================================================================


def main() -> None:
    """
    Runtime Entry Point.
    """

    observe_listing()


if __name__ == "__main__":

    main()