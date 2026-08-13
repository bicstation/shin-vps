#!/usr/bin/env python3

# ============================================================================
#
# FILE:
# acquisition/sources/scraping/ark/observe_ark.py
#
# SHIN CORE LINX
#
# ARK Product Observation Runtime
#
# Reality First
#
# Fetch Runtime
#     ↓
# Raw HTML Reality
#     ↓
# ARK Product Observation
#
# ============================================================================

from __future__ import annotations

import re

from bs4 import BeautifulSoup


# ============================================================================
# Product Card
# ============================================================================

PRODUCT_SELECTOR = "div.mdl-card"


# ============================================================================
# Text Utility
# ============================================================================

def clean_text(
    value: str,
) -> str:
    """
    Normalize whitespace only.
    """

    if not value:
        return ""

    return " ".join(
        value.split()
    ).strip()


def get_text(
    node,
) -> str:
    """
    Extract visible text from HTML node.
    """

    if node is None:
        return ""

    return clean_text(
        node.get_text(
            " ",
            strip=True,
        )
    )


def get_attr(
    node,
    name: str,
) -> str:
    """
    Extract HTML attribute.
    """

    if node is None:
        return ""

    return clean_text(
        node.get(
            name,
            "",
        )
    )


# ============================================================================
# URL Reality
# ============================================================================

def resolve_url(
    value: str,
) -> str:
    """
    Preserve observed URL value.

    Relative URLs remain relative.
    """

    return clean_text(
        value
    )


# ============================================================================
# Identity Observation
# ============================================================================

def observe_identity(
    card,
) -> dict:
    """
    Observe ARK identity values.
    """

    result = {

        "pc_id": "",

        "product_number": "",

        "model_number": "",

    }

    # ------------------------------------------------------------------------
    # PC ID
    # ------------------------------------------------------------------------

    customizer = card.select_one(
        'a[href*="/bto/customizer/"]'
    )

    if customizer is not None:

        href = get_attr(
            customizer,
            "href",
        )

        match = re.search(
            r"[?&]pc_id=([^&#]+)",
            href,
        )

        if match:

            result[
                "pc_id"
            ] = clean_text(
                match.group(1)
            )

    # ------------------------------------------------------------------------
    # Product Number / Model Number
    # ------------------------------------------------------------------------

    card_text = get_text(
        card
    )

    match = re.search(
        r"商品番号\s*:\s*([^\s]+)",
        card_text,
    )

    if match:

        result[
            "product_number"
        ] = clean_text(
            match.group(1)
        )

    match = re.search(
        r"型番\s*:\s*([^\s]+)",
        card_text,
    )

    if match:

        result[
            "model_number"
        ] = clean_text(
            match.group(1)
        )

    return result


# ============================================================================
# Product Observation
# ============================================================================

def observe_product(
    card,
) -> dict:
    """
    Observe one ARK Product Reality.

    No semantic transformation is performed.
    """

    # ------------------------------------------------------------------------
    # Identity
    # ------------------------------------------------------------------------

    identity = observe_identity(
        card
    )

    # ------------------------------------------------------------------------
    # Product Name / Model Name
    # ------------------------------------------------------------------------

    title = card.select_one(
        ".mdl_title"
    )

    paragraphs = []

    if title is not None:

        for value in title.select(
            "p"
        ):

            text = get_text(
                value
            )

            if text:

                paragraphs.append(
                    text
                )

    product_name = ""

    model_name = ""

    if len(paragraphs) >= 1:

        product_name = paragraphs[0]

    if len(paragraphs) >= 2:

        model_name = paragraphs[1]

    # ------------------------------------------------------------------------
    # Product URL
    # ------------------------------------------------------------------------

    product_url = ""

    product_link = card.select_one(
        'a[href*="/bto/customizer/"]'
    )

    if product_link is not None:

        product_url = resolve_url(
            get_attr(
                product_link,
                "href",
            )
        )

    # ------------------------------------------------------------------------
    # Image URL
    # ------------------------------------------------------------------------

    image_url = ""

    image = card.select_one(
        "img[data-src]"
    )

    if image is not None:

        image_url = resolve_url(
            get_attr(
                image,
                "data-src",
            )
        )

    if not image_url:

        image = card.select_one(
            "img[src]"
        )

        if image is not None:

            image_url = resolve_url(
                get_attr(
                    image,
                    "src",
                )
            )

    # ------------------------------------------------------------------------
    # Description
    # ------------------------------------------------------------------------

    description = ""

    description_node = card.select_one(
        ".mdl_desc"
    )

    if description_node is not None:

        description = get_text(
            description_node
        )

    # ------------------------------------------------------------------------
    # Price
    # ------------------------------------------------------------------------

    price = ""

    price_node = card.select_one(
        '[itemprop="price"]'
    )

    if price_node is not None:

        price = get_text(
            price_node
        )

    # ------------------------------------------------------------------------
    # Specifications
    # ------------------------------------------------------------------------

    specifications = {}

    spec_table = card.select_one(
        ".mdl_spec_list"
    )

    if spec_table is not None:

        for row in spec_table.select(
            "tr"
        ):

            cells = row.select(
                "td"
            )

            if len(cells) < 2:

                continue

            label = get_text(
                cells[0]
            )

            value = get_text(
                cells[1]
            )

            if not label:

                continue

            if not value:

                continue

            specifications[
                label
            ] = value

    # ------------------------------------------------------------------------
    # Release Date
    # ------------------------------------------------------------------------

    release_date = ""

    match = re.search(
        r"リリース\s*:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})",
        get_text(card),
    )

    if match:

        release_date = clean_text(
            match.group(1)
        )

    # ------------------------------------------------------------------------
    # Raw HTML
    # ------------------------------------------------------------------------

    raw_html = str(
        card
    )

    # ------------------------------------------------------------------------
    # Product Reality
    # ------------------------------------------------------------------------

    return {

        "identity": identity,

        "product": {

            "product_name":
                product_name,

            "model_name":
                model_name,

        },

        "commerce": {

            "price":
                price,

        },

        "url": {

            "product_url":
                product_url,

        },

        "media": {

            "image_url":
                image_url,

        },

        "description":
            description,

        "specifications":
            specifications,

        "release_date":
            release_date,

        "raw_html":
            raw_html,

    }


# ============================================================================
# Product Card Observation
# ============================================================================

def observe_product_cards(
    html: str,
) -> list[dict]:
    """
    Observe all Product Realities in one page.
    """

    if not html:

        return []

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    cards = soup.select(
        PRODUCT_SELECTOR
    )

    observations = []

    for card in cards:

        observations.append(
            observe_product(
                card
            )
        )

    return observations


# ============================================================================
# Single Runtime Observation
# ============================================================================

def observe_runtime(
    runtime: dict,
) -> dict:
    """
    Observe one fetched ARK page.
    """

    html = runtime.get(
        "response_text",
        "",
    )

    products = observe_product_cards(
        html
    )

    observed = dict(
        runtime
    )

    # ------------------------------------------------------------------------
    # Structured Product Reality
    # ------------------------------------------------------------------------

    observed[
        "products"
    ] = products

    # ------------------------------------------------------------------------
    # Compatibility
    # ------------------------------------------------------------------------

    observed[
        "product_cards"
    ] = [

        product[
            "raw_html"
        ]

        for product in products

    ]

    observed[
        "product_count"
    ] = len(
        products
    )

    # ------------------------------------------------------------------------
    # Page Result
    # ------------------------------------------------------------------------

    print()

    print(
        "=" * 70
    )

    print(
        "ARK OBSERVATION"
    )

    print(
        "=" * 70
    )

    print(
        f"Entry           : "
        f"{runtime.get('seed', {}).get('entry_name', '')}"
    )

    print(
        f"Page            : "
        f"{runtime.get('page', '')}"
    )

    print(
        f"Product Cards   : "
        f"{len(products)}"
    )

    print(
        "=" * 70
    )

    return observed


# ============================================================================
# Observation Sample
# ============================================================================

def print_observation_sample(
    observations: list[dict],
) -> None:
    """
    Print one Product Reality sample.

    This is observation reporting only.
    """

    sample = None

    for observation in observations:

        products = observation.get(
            "products",
            [],
        )

        if products:

            sample = products[0]

            break

    if sample is None:

        print()

        print(
            "=" * 70
        )

        print(
            "ARK OBSERVATION SAMPLE"
        )

        print(
            "=" * 70
        )

        print(
            "No Product Reality available."
        )

        print(
            "=" * 70
        )

        return

    print()

    print(
        "=" * 70
    )

    print(
        "ARK OBSERVATION SAMPLE"
    )

    print(
        "=" * 70
    )

    # ------------------------------------------------------------------------
    # Identity
    # ------------------------------------------------------------------------

    print()

    print(
        "IDENTITY"
    )

    print(
        "-" * 70
    )

    identity = sample.get(
        "identity",
        {},
    )

    print(
        f"pc_id          : "
        f"{identity.get('pc_id', '')}"
    )

    print(
        f"product_number : "
        f"{identity.get('product_number', '')}"
    )

    print(
        f"model_number   : "
        f"{identity.get('model_number', '')}"
    )

    # ------------------------------------------------------------------------
    # Product
    # ------------------------------------------------------------------------

    print()

    print(
        "PRODUCT"
    )

    print(
        "-" * 70
    )

    product = sample.get(
        "product",
        {},
    )

    print(
        f"product_name : "
        f"{product.get('product_name', '')}"
    )

    print(
        f"model_name   : "
        f"{product.get('model_name', '')}"
    )

    # ------------------------------------------------------------------------
    # Commerce
    # ------------------------------------------------------------------------

    print()

    print(
        "COMMERCE"
    )

    print(
        "-" * 70
    )

    commerce = sample.get(
        "commerce",
        {},
    )

    print(
        f"price : "
        f"{commerce.get('price', '')}"
    )

    # ------------------------------------------------------------------------
    # URL
    # ------------------------------------------------------------------------

    print()

    print(
        "URL"
    )

    print(
        "-" * 70
    )

    url = sample.get(
        "url",
        {},
    )

    print(
        f"product_url : "
        f"{url.get('product_url', '')}"
    )

    # ------------------------------------------------------------------------
    # Media
    # ------------------------------------------------------------------------

    print()

    print(
        "MEDIA"
    )

    print(
        "-" * 70
    )

    media = sample.get(
        "media",
        {},
    )

    print(
        f"image_url : "
        f"{media.get('image_url', '')}"
    )

    # ------------------------------------------------------------------------
    # Description
    # ------------------------------------------------------------------------

    print()

    print(
        "DESCRIPTION"
    )

    print(
        "-" * 70
    )

    print(
        sample.get(
            "description",
            "",
        )
    )

    # ------------------------------------------------------------------------
    # Specifications
    # ------------------------------------------------------------------------

    print()

    print(
        "SPECIFICATIONS"
    )

    print(
        "-" * 70
    )

    specifications = sample.get(
        "specifications",
        {},
    )

    if specifications:

        for key, value in specifications.items():

            print(
                f"{key:<12}: {value}"
            )

    else:

        print(
            "(none)"
        )

    # ------------------------------------------------------------------------
    # Release
    # ------------------------------------------------------------------------

    print()

    print(
        "RELEASE DATE"
    )

    print(
        "-" * 70
    )

    print(
        sample.get(
            "release_date",
            "",
        )
    )

    # ------------------------------------------------------------------------
    # Raw Reality
    # ------------------------------------------------------------------------

    print()

    print(
        "RAW HTML"
    )

    print(
        "-" * 70
    )

    raw_html = sample.get(
        "raw_html",
        "",
    )

    print(
        f"Raw HTML Size : "
        f"{len(raw_html):,} bytes"
    )

    print(
        "=" * 70
    )


# ============================================================================
# Runtime
# ============================================================================

def observe(
    *,
    runtimes: list[dict],
    **kwargs,
) -> list[dict]:
    """
    Observe all fetched ARK pages.
    """

    observations = []

    total_products = 0

    for runtime in runtimes:

        observed = observe_runtime(
            runtime
        )

        observations.append(
            observed
        )

        total_products += (
            observed[
                "product_count"
            ]
        )

    # ------------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------------

    print()

    print(
        "=" * 70
    )

    print(
        "ARK OBSERVATION COMPLETE"
    )

    print(
        "=" * 70
    )

    print(
        f"Page Runtimes     : "
        f"{len(observations)}"
    )

    print(
        f"Product Realities : "
        f"{total_products}"
    )

    print(
        "=" * 70
    )

    # ------------------------------------------------------------------------
    # Sample
    # ------------------------------------------------------------------------

    print_observation_sample(
        observations
    )

    return observations


# ============================================================================
# Entry Point
# ============================================================================

def main(
    *,
    runtimes: list[dict],
    **kwargs,
):

    return observe(
        runtimes=runtimes,
        **kwargs,
    )


# ============================================================================
# Standalone Execution
# ============================================================================

if __name__ == "__main__":

    main(
        runtimes=[],
    )