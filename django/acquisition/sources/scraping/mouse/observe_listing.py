#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/mouse/observe_listing.py

SHIN CORE LINX

MOUSE Listing Observation Runtime

Reality First
Observation First


Listing HTML
│
▼
MOUSE Product Card
│
├── Product URL
├── Product Name
├── Product No
├── Description
├── Specifications
├── Price
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
- Observe published Product URL
- Observe published Product Name
- Observe published Product Number
- Observe published Product Description
- Observe published Specifications
- Observe published Price
- Observe published Image URL
- Preserve observed Listing Reality
- Persist Card Reality


NOT Responsibilities

- Individual Product Page Acquisition
- Individual Product Page HTTP Request
- HTML outside Listing Documents
- Semantic Classification
- Runtime Contract
- Formatter
- Mapper
- Product Building
- Semantic Processing


IMPORTANT

MOUSE Listing pages already contain the required Product Reality.

The Product Detail URL appearing inside a Listing Card is only
an observed field.

It is NOT used to perform another HTTP request.

Therefore:

    Listing AcquisitionDocument
            │
            ▼
       Listing HTML
            │
            ▼
       Product Card
            │
            ├── Product URL
            ├── Product Name
            ├── Product No
            ├── Description
            ├── Specifications
            ├── Price
            └── Image URL
            │
            ▼
      Observed Card Reality
            │
            ▼
   AcquisitionDocument(card)


No individual Product Detail page is fetched.

==============================================================================
"""

from __future__ import annotations

import json

from urllib.parse import (
    parse_qs,
    urljoin,
    urlparse,
)

from bs4 import BeautifulSoup

from api.models import (
    AcquisitionDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    SOURCE_NAME,
)


# ==============================================================================
# Helpers
# ==============================================================================


def absolute_url(
    href: str,
    base_url: str,
) -> str:
    """
    Resolve a published relative URL against the Listing URL.

    This is URL normalization only.

    No URL generation.
    """

    if not href:
        return ""

    href = href.strip()

    if not href:
        return ""

    return urljoin(
        base_url,
        href,
    )


def clean_text(
    value: str | None,
) -> str:
    """
    Normalize structural whitespace only.

    No semantic interpretation.
    """

    if not value:
        return ""

    return " ".join(
        value.split()
    ).strip()


# ==============================================================================
# Document Key
# ==============================================================================


def document_key(
    url: str,
) -> str:
    """
    Create Card Document Key from observed Product URL.

    Example:

        /store/g/ggtune-dga7g70b6bddw101dec/

    becomes:

        ggtune-dga7g70b6bddw101dec
    """

    if not url:
        return ""

    parsed = urlparse(
        url,
    )

    # ==========================================================================
    # Query Parameter Fallback
    # ==========================================================================

    query = parse_qs(
        parsed.query,
    )

    for parameter in (
        "no",
        "product_no",
        "sku",
        "code",
    ):

        values = query.get(
            parameter,
            [],
        )

        if values:

            key = clean_text(
                values[0],
            )

            if key:

                return key

    # ==========================================================================
    # Path
    # ==========================================================================

    path = (
        parsed.path
        .rstrip("/")
    )

    if not path:

        return ""

    parts = [
        part
        for part in path.split("/")
        if part
    ]

    if not parts:

        return ""

    return parts[-1]


# ==============================================================================
# Product URL Observation
# ==============================================================================


def observe_product_url(
    card,
    listing_url: str,
) -> str:
    """
    Observe Product URL published inside the Listing Card.

    MOUSE example:

        <a
            href="/store/g/ggtune-dga7g70b6bddw101dec/"
            class="block-goods-list-4CD--item-btn-more-btn ..."
        >
            製品を詳しくみる
        </a>

    IMPORTANT

    This function ONLY reads the href.

    It does NOT request the Product Detail page.
    """

    link = card.select_one(
        ".block-goods-list-4CD--item-btn-more-btn[href]"
    )

    if not link:

        return ""

    href = link.get(
        "href",
        "",
    )

    return absolute_url(
        href,
        listing_url,
    )


# ==============================================================================
# Product Name Observation
# ==============================================================================


def observe_product_name(
    card,
) -> str:
    """
    Observe published Product Name.

    MOUSE:

        .block-goods-list-4CD--item-name
    """

    element = card.select_one(
        ".block-goods-list-4CD--item-name"
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
# Product Number Observation
# ==============================================================================


def observe_product_no(
    card,
) -> str:
    """
    Observe published Product Number.

    MOUSE:

        <span class="item_code2">
            [DGA7G70B6BDDW101DEC]
        </span>

    Only presentation brackets are removed.
    """

    element = card.select_one(
        ".item_code2"
    )

    if not element:

        return ""

    value = clean_text(
        element.get_text(
            " ",
            strip=True,
        )
    )

    if (
        value.startswith("[")
        and value.endswith("]")
    ):

        value = value[1:-1].strip()

    return value


# ==============================================================================
# Description Observation
# ==============================================================================


def observe_product_description(
    card,
) -> str:
    """
    Observe published Product Description.

    MOUSE:

        .block-goods-list-4CD--item-comment
    """

    element = card.select_one(
        ".block-goods-list-4CD--item-comment"
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


def observe_specifications(
    card,
) -> list[str]:
    """
    Observe published Listing Specifications.

    MOUSE:

        <ul class="block-goods-list-4CD--item-spec">

            <li class="block-goods-list-4CD--item-spec-item">

                <span
                    class="block-goods-list-4CD--item-spec-item-text"
                >
                    Windows 11 Home 64ビット
                </span>

            </li>

            ...

        </ul>


    IMPORTANT

    The Listing Card does not expose a reliable
    label/value structure.

    Therefore the Observer preserves the published
    specification strings as-is.

    It does NOT create:

        CPU
        GPU
        Memory
        Storage
        OS

    labels.

    Those meanings belong to later Translation / Mapping stages.
    """

    specifications: list[str] = []

    elements = card.select(
        ".block-goods-list-4CD--item-spec-item-text"
    )

    for element in elements:

        value = clean_text(
            element.get_text(
                " ",
                strip=True,
            )
        )

        if not value:

            continue

        specifications.append(
            value,
        )

    return specifications


# ==============================================================================
# Price Observation
# ==============================================================================


def observe_price(
    card,
) -> str:
    """
    Observe published tax-included price.

    MOUSE:

        .goods-price-zeikomi
            .goods-price-value

    Example:

        509,800
    """

    price_block = card.select_one(
        ".block-goods-list-4CD--item-price"
    )

    if not price_block:

        return ""

    element = price_block.select_one(
        ".goods-price-zeikomi .goods-price-value"
    )

    if not element:

        element = price_block.select_one(
            ".goods-price-value"
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
    listing_url: str,
) -> str:
    """
    Observe published Listing Image URL.

    MOUSE:

        <figure
            class="block-goods-list-4CD--item-img-figure"
        >
            <img src="...">
        </figure>
    """

    element = card.select_one(
        ".block-goods-list-4CD--item-img-figure img[src]"
    )

    if not element:

        return ""

    src = element.get(
        "src",
        "",
    )

    return absolute_url(
        src,
        listing_url,
    )


# ==============================================================================
# Card Observation
# ==============================================================================


def observe_card(
    card,
    listing_url: str,
) -> dict:
    """
    Observe one Product Card from the Listing HTML.

    This function reads ONLY the Card.

    No individual Product Detail request.
    """

    return {

        "product_url":
            observe_product_url(
                card,
                listing_url,
            ),

        "product_name":
            observe_product_name(
                card,
            ),

        "product_no":
            observe_product_no(
                card,
            ),

        "description":
            observe_product_description(
                card,
            ),

        "specifications":
            observe_specifications(
                card,
            ),

        "price":
            observe_price(
                card,
            ),

        "image_url":
            observe_image_url(
                card,
                listing_url,
            ),

    }


# ==============================================================================
# Card Discovery
# ==============================================================================


def discover_cards(
    html: str,
) -> list:
    """
    Discover MOUSE Product Cards from Listing HTML.

    MOUSE observed Card structure:

        .block-goods-list-4CD--item

    The Card itself contains:

        .block-goods-list-4CD--item-name
        .item_code2
        .block-goods-list-4CD--item-comment
        .block-goods-list-4CD--item-spec
        .block-goods-list-4CD--item-price
        .block-goods-list-4CD--item-img-figure
        .block-goods-list-4CD--item-btn-more-btn

    IMPORTANT

    The Product Detail URL is merely one field inside the Card.

    We do NOT use the URL to fetch anything.

    We discover the Card from the Listing DOM itself.
    """

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    # ==========================================================================
    # Primary Card Root
    # ==========================================================================

    cards = soup.select(
        ".block-goods-list-4CD--item"
    )

    if cards:

        return cards

    # ==========================================================================
    # Structural Fallback
    #
    # Some MOUSE Listing pages may not expose the root class
    # consistently. In that case use the Product Name as the
    # structural anchor and walk upward.
    # ==========================================================================

    cards = []

    seen: set[int] = set()

    name_elements = soup.select(
        ".block-goods-list-4CD--item-name"
    )

    for name_element in name_elements:

        ancestor = name_element.parent

        while ancestor is not None:

            has_name = bool(
                ancestor.select_one(
                    ".block-goods-list-4CD--item-name"
                )
            )

            has_price = bool(
                ancestor.select_one(
                    ".block-goods-list-4CD--item-price"
                )
            )

            has_detail = bool(
                ancestor.select_one(
                    ".block-goods-list-4CD--item-btn-more-btn[href]"
                )
            )

            if (
                has_name
                and has_price
                and has_detail
            ):

                identity = id(
                    ancestor
                )

                if identity not in seen:

                    seen.add(
                        identity
                    )

                    cards.append(
                        ancestor
                    )

                break

            ancestor = ancestor.parent

    return cards


# ==============================================================================
# Persistence
# ==============================================================================


def save_card_document(
    *,
    observation: dict,
) -> tuple[
    AcquisitionDocument,
    bool,
]:
    """
    Persist observed Listing Card Reality.

    Content is JSON.

    No HTML parsing happens after this stage.
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
            f"from observed Product URL: {url}"
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

                "source_url":
                    url,

                "content_type":
                    (
                        "application/json;"
                        " source=listing-observation"
                    ),

                "content":
                    content,
            },
        )
    )


# ==============================================================================
# Observation Runtime
# ==============================================================================


def observe_listing() -> None:
    """
    Execute MOUSE Listing Observation Runtime.

    Input:

        AcquisitionDocument(listing)

    Output:

        AcquisitionDocument(card)

    No Product Detail HTTP request.
    """

    trace_pipeline(
        "LISTING OBSERVATION",
    )

    print()

    print(
        "=" * 70
    )

    print(
        "MOUSE LISTING OBSERVATION"
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

            document_type="listing",

        )

        .exclude(

            content="",

        )

        .order_by(
            "document_key",
        )

        .iterator()

    )

    seen_product_urls: set[str] = set()

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
            f"LISTING : {document.document_key}"
        )

        print(
            f"URL     : {document.source_url}"
        )

        print(
            "=" * 70
        )

        cards = discover_cards(
            document.content,
        )

        print(
            f"CARDS   : {len(cards)}"
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
                # Observe ONLY the Listing Card
                # ----------------------------------------------------------------

                observation = observe_card(
                    card,
                    document.source_url,
                )

                product_url = observation.get(
                    "product_url",
                    "",
                )

                product_name = observation.get(
                    "product_name",
                    "",
                )

                # ----------------------------------------------------------------
                # Product URL is a required observed identity.
                #
                # IMPORTANT:
                #
                # This URL is NOT requested.
                # It is only persisted as observed Reality.
                # ----------------------------------------------------------------

                if not product_url:

                    skipped_count += 1

                    print(
                        f"SKIP [{index:>3}] "
                        "Product URL not found in Listing Card"
                    )

                    continue

                # ----------------------------------------------------------------
                # Product Name
                # ----------------------------------------------------------------

                if not product_name:

                    skipped_count += 1

                    print(
                        f"SKIP [{index:>3}] "
                        "Product Name not found in Listing Card"
                    )

                    continue

                # ----------------------------------------------------------------
                # Duplicate Protection
                # ----------------------------------------------------------------

                if product_url in seen_product_urls:

                    skipped_count += 1

                    print(
                        f"SKIP [{index:>3}] "
                        f"DUPLICATE : {product_url}"
                    )

                    continue

                seen_product_urls.add(
                    product_url
                )

                # ----------------------------------------------------------------
                # Persist Card Reality
                # ----------------------------------------------------------------

                (
                    card_document,
                    created,
                ) = save_card_document(
                    observation=observation,
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
                    f"  NAME  : "
                    f"{observation['product_name']}"
                )

                print(
                    f"  NO    : "
                    f"{observation['product_no']}"
                )

                print(
                    f"  URL   : "
                    f"{observation['product_url']}"
                )

                print(
                    f"  DESC  : "
                    f"{observation['description']}"
                )

                print(
                    f"  SPEC  : "
                    f"{len(observation['specifications'])}"
                    " items"
                )

                print(
                    f"  PRICE : "
                    f"{observation['price']}"
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
        "MOUSE LISTING OBSERVATION RESULT"
    )

    print(
        "=" * 70
    )

    print(
        f"LISTINGS : {document_count}"
    )

    print(
        f"CARDS    : {card_count}"
    )

    print(
        f"CREATED  : {created_count}"
    )

    print(
        f"UPDATED  : {updated_count}"
    )

    print(
        f"SKIPPED  : {skipped_count}"
    )

    print(
        f"OBSERVED : "
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


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()