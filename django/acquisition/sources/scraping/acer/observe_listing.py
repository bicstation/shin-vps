#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/sycom/observe_listing.py

SHIN CORE LINX

SYCOM Listing Observation Runtime

Reality First
Observation First

Listing HTML
│
▼
Product Card (.inner01)
│
├── Product Detail URL
├── Product Name
├── Product Description
├── Specification
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
- Observe published Product Detail URL
- Observe published Product Name
- Observe published Product Description
- Observe published Specifications
- Observe published Price
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

SYCOM listing pages already contain the required Product Card Reality.

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
    BASE_URL,
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
    Convert relative URL into absolute URL.

    Reality Rule:

    Resolve relative URLs against the actual Listing URL.

    This is important because SYCOM uses paths such as:

        ../../lineup/img_new/xxx.webp

    and:

        /custom/model?no=001021
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
    Create document key from SYCOM Product URL.

    Example:

        /custom/model?no=001021

    becomes:

        001021

    The query parameter `no` is the published model identifier.
    """

    parsed = urlparse(
        url,
    )

    query = parse_qs(
        parsed.query,
    )

    values = query.get(
        "no",
        [],
    )

    if values:

        key = values[0].strip()

        if key:
            return key

    # --------------------------------------------------------------------------
    # Fallback
    # --------------------------------------------------------------------------

    path = (
        parsed.path
        .rstrip("/")
    )

    if path:

        return (
            path
            .split("/")
            [-1]
        )

    return ""


# ==============================================================================
# Product Detail URL Observation
# ==============================================================================


def observe_product_url(
    card,
    listing_url: str,
) -> str:
    """
    Observe published Product Detail URL.

    SYCOM card:

        <p class="btn">
            <a href="/custom/model?no=001021">
                カスタマイズ
            </a>
        </p>

    The href itself is Reality.

    No URL generation.
    No semantic interpretation.
    """

    link = card.select_one(
        ".btn a[href]"
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

    Example:

        <p class="name01">
            Radiant GZ3600B860
        </p>
    """

    element = card.select_one(
        ".name01"
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
# Product Description Observation
# ==============================================================================


def observe_product_description(
    card,
) -> str:
    """
    Observe published Product Description.

    Example:

        <p class="tx01">
            Intel Core Ultraプロセッサを搭載する...
        </p>

    Description is preserved as published Reality.
    """

    element = card.select_one(
        ".tx01"
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
) -> list[dict]:
    """
    Observe published Product Specifications.

    SYCOM publishes specifications as:

        <ul class="specList01">
            <li>
                <dl>
                    <dt>CPU</dt>
                    <dd>Intel Core Ultra 5 225</dd>
                </dl>
            </li>
            ...
        </ul>

    Reality is preserved as label/value pairs.

    Example:

        [
            {
                "label": "CPU",
                "value": "Intel Core Ultra 5 225",
            },
            {
                "label": "グラフィック",
                "value": "内蔵グラフィック",
            },
        ]

    No semantic translation occurs here.
    """

    specifications: list[dict] = []

    elements = card.select(
        ".specList01 li"
    )

    for element in elements:

        label_element = element.select_one(
            "dt"
        )

        value_element = element.select_one(
            "dd"
        )

        if not label_element:
            continue

        if not value_element:
            continue

        label = clean_text(
            label_element.get_text(
                " ",
                strip=True,
            )
        )

        value = clean_text(
            value_element.get_text(
                " ",
                strip=True,
            )
        )

        if not label:
            continue

        specifications.append(
            {
                "label": label,
                "value": value,
            }
        )

    return specifications


# ==============================================================================
# Price Observation
# ==============================================================================


def observe_price(
    card,
) -> str:
    """
    Observe published Product Price.

    SYCOM:

        <span class="num">
            182,320
        </span>

    The numeric published value is preserved.

    No currency calculation.
    No tax calculation.
    No semantic interpretation.
    """

    element = card.select_one(
        ".price .num"
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
    Observe published Product Image URL.

    SYCOM:

        <figure class="thumb01">
            <img
                src="../../lineup/img_new/Radiant_GZ3600B860.webp"
            >
        </figure>

    Resolve against the actual Listing URL.
    """

    element = card.select_one(
        ".thumb01 img[src]"
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
    Observe one SYCOM Product Card.

    Returns published Card Reality only.

    No semantic classification.
    No runtime mapping.
    No product building.
    """

    product_url = observe_product_url(
        card,
        listing_url,
    )

    product_name = observe_product_name(
        card,
    )

    description = observe_product_description(
        card,
    )

    specifications = observe_specifications(
        card,
    )

    price = observe_price(
        card,
    )

    image_url = observe_image_url(
        card,
        listing_url,
    )

    return {

        "product_url":
            product_url,

        "product_name":
            product_name,

        "description":
            description,

        "specifications":
            specifications,

        "price":
            price,

        "image_url":
            image_url,

    }


# ==============================================================================
# Card Discovery
# ==============================================================================


def discover_cards(
    html: str,
) -> list:
    """
    Discover Product Cards from Listing HTML.

    SYCOM product cards are represented by:

        <div class="inner01">

    Every confirmed Listing page uses this structure.

    We intentionally use the product name element as an
    additional structural guard.
    """

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    cards = soup.select(
        "div.inner01:has(.name01)"
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

                "source_url":
                    url,

                "content_type":
                    (
                        "application/json; "
                        "source=listing-observation"
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
    Execute SYCOM Listing Observation Runtime.

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
        "SYCOM LISTING OBSERVATION"
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
                    document.source_url,
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
                    f"  DESC  : "
                    f"{observation['description']}"
                )

                print(
                    f"  SPEC  : "
                    f"{observation['specifications']}"
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