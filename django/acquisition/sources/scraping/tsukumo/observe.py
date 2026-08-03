#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Card Observation

Observation Runtime

AcquisitionDocument (Catalog)
        │
        ▼
Product Cards
        │
        ▼
Observation Document

Reality First
Observation First

Responsibilities

- Observe Published Product Cards
- Observe Published Reality
- Produce Observation Runtime

Not Responsibilities

- Formatter
- Mapping
- Semantic
- AI
- Product Integration
==============================================================================
"""

from __future__ import annotations

import json

from bs4 import BeautifulSoup

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import trace_pipeline

from .settings import (
    BASE_URL,
    SITE_NAME,
)

# ==============================================================================
# Observation Contract
# ==============================================================================

CARD_FIELDS = (

    "category",

    "raw_title",

    "product_id",

    "product_code",

    "price",

    "image_url",

    "detail_url",

    "specs",

    "release",

    "labels",

)

DOCUMENT_TYPE = "observation"

CATALOG_DOCUMENT = "catalog"

# ==============================================================================
# Helpers
# ==============================================================================

def absolute_url(
    url: str,
) -> str:

    if not url:
        return ""

    if url.startswith("//"):
        return "https:" + url

    if url.startswith("/"):
        return BASE_URL + url

    return url


def observe_price(
    card,
) -> str:

    #
    # Reality
    # Displayed Price
    #

    price = card.select_one(
        ".nec_product_productCard__carousel__card__body__info__detail__status__price__special strong",
    )

    if price is not None:

        value = (
            price.get_text(
                strip=True,
            )
            .replace(",", "")
            .replace("円", "")
        )

        if value:

            return value

    #
    # Runtime
    # data-productprice
    #

    image = card.select_one(
        "[data-productprice]",
    )

    if image is not None:

        value = image.get(
            "data-productprice",
            "",
        )

        if value:

            return value

    return ""


def observe_specs(
    card,
) -> list[str]:

    specs = []

    for li in card.select(
        ".nec_product_productCard__carousel__card__body__info__detail__spec li",
    ):

        text = li.get_text(
            " ",
            strip=True,
        )

        if text:
            specs.append(
                text,
            )

    return specs


def observe_labels(
    card,
) -> list[str]:

    labels = []

    for li in card.select(
        ".nec_product_productCard__carousel__card__body__info__detail__status__label li",
    ):

        text = li.get_text(
            " ",
            strip=True,
        )

        if text:
            labels.append(
                text,
            )

    return labels


def observe_release(
    card,
) -> str:

    release = card.select_one(
        ".nec_product_productCard__carousel__card__body__info__detail__leadtime",
    )

    if release is None:
        return ""

    return release.get_text(
        " ",
        strip=True,
    )


def observe_image(
    card,
) -> str:

    image = card.select_one(
        ".nec_product_productCard__carousel__card__body__image img",
    )

    if image is None:
        return ""

    url = (

        image.get(
            "src",
        )

        or image.get(
            "data-src",
        )

        or image.get(
            "data-original",
        )

        or ""

    )

    return absolute_url(
        url,
    )


def observe_detail_url(
    card,
) -> str:

    link = card.select_one(
        "a.productCard_dlpDetail[href]",
    )

    if link is None:
        return ""

    return absolute_url(
        link.get(
            "href",
            "",
        )
    )


# ==============================================================================
# Card Observation
# ==============================================================================

def observe_card(
    *,
    category: str,
    card,
) -> dict | None:

    title = card.select_one(
        "h3",
    )

    image = card.select_one(
        "[data-id]",
    )

    if title is None or image is None:
        return None

    raw_title = title.get_text(
        " ",
        strip=True,
    )

    product_id = image.get(
        "data-id",
        "",
    )

    product_code = image.get(
        "data-productcode",
        "",
    )

    return {

        "category": category,

        "raw_title": raw_title,

        "product_id": product_id,

        "product_code": product_code,

        "price": observe_price(
            card,
        ),

        "image_url": observe_image(
            card,
        ),

        "detail_url": observe_detail_url(
            card,
        ),

        "specs": observe_specs(
            card,
        ),

        "release": observe_release(
            card,
        ),

        "labels": observe_labels(
            card,
        ),

    }

# ==============================================================================
# Catalog Observation
# ==============================================================================

def observe_catalog() -> list[dict]:

    trace_pipeline(
        "CARD OBSERVATION",
    )

    observations = []

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_name=SITE_NAME.lower(),

            document_type="catalog",

        )

        .order_by(

            "document_key",

        )

    )

    print("=" * 70)
    print(f"{SITE_NAME} CARD OBSERVATION")
    print("=" * 70)

    for document in documents:

        category = document.document_key

        soup = BeautifulSoup(

            document.content,

            "html.parser",

        )

        cards = soup.select(

            ".dlp-products-card",

        )

        print(

            f"{category} : {len(cards)} cards",

        )

        for card in cards:

            observation = observe_card(

                category=category,

                card=card,

            )

            if observation is None:

                continue

            observations.append(

                observation,

            )

    print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"Observed : {len(observations)}")
    print("=" * 70)

    return observations

# ==============================================================================
# Persistence Runtime
# ==============================================================================

def save_observation(
    observations: list[dict],
) -> None:

    print("=" * 70)
    print("SAVE OBSERVATION")
    print("=" * 70)

    document, created = AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_TYPE,

        document_key="catalog",

        defaults={

            "source_url": "",

            "content_type": "application/json",

            "content": json.dumps(

                observations,

                ensure_ascii=False,

                indent=2,

            ),

        },

    )

    print(

        "Observation :",

        "CREATED" if created else "UPDATED",

    )

    print("=" * 70)

# ==============================================================================
# Runtime
# ==============================================================================

def observe() -> None:

    observations = observe_catalog()

    save_observation(
        observations,
    )


# ==============================================================================
# Entry Point
# ==============================================================================

def main() -> None:

    observe()


if __name__ == "__main__":

    main()

