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
        │
        ▼
Save

Reality First
Observation First

Responsibilities

- Observe Published Product Cards
- Preserve Published Reality
- Produce Observation Runtime

Not Responsibilities

- Semantic Processing
- AI Analysis
- CPU / GPU interpretation
- Memory / Storage interpretation
- Specification normalization
- Product Construction
- Product Integration

==============================================================================

IMPORTANT

This Runtime does NOT interpret Reality.

It simply observes what TSUKUMO publishes in the product card.

IMPORTANT

Observation persistence is PRODUCT CARD based.

Catalog documents contain multiple cards.

Therefore:

    Catalog Document
          │
          ├── Card 001 → Observation 001
          ├── Card 002 → Observation 002
          ├── Card 003 → Observation 003
          └── ...

Each product card is stored independently.

Reality First.
==============================================================================
"""

from __future__ import annotations

import hashlib
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
# HTML Helpers
# ==============================================================================

def select_text(
    soup: BeautifulSoup,
    selector: str,
) -> str:
    """
    Extract visible text from the first matching element.

    No interpretation is performed.
    """

    element = soup.select_one(
        selector,
    )

    if not element:
        return ""

    return element.get_text(
        " ",
        strip=True,
    )


def select_attr(
    soup: BeautifulSoup,
    selector: str,
    attribute: str,
) -> str:
    """
    Extract an HTML attribute from the first matching element.

    No interpretation is performed.
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
    Extract Schema.org meta content.

    Published Reality only.
    """

    element = soup.select_one(
        f'meta[itemprop="{itemprop}"]',
    )

    if not element:
        return ""

    return element.get(
        "content",
        "",
    )


def first_text(
    soup: BeautifulSoup,
    selectors: tuple[str, ...],
) -> str:
    """
    Try multiple visible-text selectors.

    The first non-empty published value is returned.

    No interpretation is performed.
    """

    for selector in selectors:

        value = select_text(
            soup,
            selector,
        )

        if value:

            return value

    return ""


def first_attr(
    soup: BeautifulSoup,
    selectors: tuple[str, ...],
    attribute: str,
) -> str:
    """
    Try multiple attribute selectors.

    The first non-empty published value is returned.

    No interpretation is performed.
    """

    for selector in selectors:

        value = select_attr(
            soup,
            selector,
            attribute,
        )

        if value:

            return value

    return ""


def first_meta(
    soup: BeautifulSoup,
    itemprops: tuple[str, ...],
) -> str:
    """
    Try multiple Schema.org itemprop values.

    The first non-empty published value is returned.
    """

    for itemprop in itemprops:

        value = select_meta(
            soup,
            itemprop,
        )

        if value:

            return value

    return ""


# ==============================================================================
# Specification Reality
# ==============================================================================

def select_specifications(
    soup: BeautifulSoup,
) -> list[str]:
    """
    Preserve published product Reality.

    No CPU / GPU / Memory / Storage interpretation
    is performed.

    Published strings are preserved directly.
    """

    specifications: list[str] = []

    # --------------------------------------------------------------------------
    # Product title
    # --------------------------------------------------------------------------

    raw_title = first_meta(
        soup,
        (
            "name",
        ),
    )

    if not raw_title:

        raw_title = first_text(
            soup,
            (
                "h1.product-name",
                "h2.product-name",
                ".product-name",
            ),
        )

    if raw_title:

        specifications.append(
            raw_title,
        )

    # --------------------------------------------------------------------------
    # Product description
    # --------------------------------------------------------------------------

    raw_description = first_meta(
        soup,
        (
            "description",
        ),
    )

    if not raw_description:

        raw_description = first_text(
            soup,
            (
                'div[itemtype="http://schema.org/Product"]',
            ),
        )

    if raw_description:

        if raw_description not in specifications:

            specifications.append(
                raw_description,
            )

    # --------------------------------------------------------------------------
    # Visible product summary
    # --------------------------------------------------------------------------

    raw_summary = first_text(
        soup,
        (
            "div.search-box__product > div > p",
            'div[itemtype="http://schema.org/Product"] + div p',
        ),
    )

    if raw_summary:

        if raw_summary not in specifications:

            specifications.append(
                raw_summary,
            )

    return specifications


# ==============================================================================
# Labels
# ==============================================================================

def select_labels(
    soup: BeautifulSoup,
) -> list[str]:
    """
    Preserve published labels.
    """

    labels: list[str] = []

    for label in soup.select(
        ".label_space span",
    ):

        value = label.get_text(
            " ",
            strip=True,
        )

        if value and value not in labels:

            labels.append(
                value,
            )

    return labels


# ==============================================================================
# Product Observation
# ==============================================================================

def observe_card(
    *,
    document_key: str,
    card_html: str,
) -> dict:
    """
    Observe one TSUKUMO product card.

    No semantic interpretation is performed.

    The Runtime only extracts published Reality
    from the card HTML.
    """

    soup = BeautifulSoup(
        card_html,
        "html.parser",
    )

    # ==========================================================================
    # Product
    # ==========================================================================

    raw_title = first_meta(
        soup,
        (
            "name",
        ),
    )

    if not raw_title:

        raw_title = first_text(
            soup,
            (
                "h1.product-name",
                "h2.product-name",
                ".product-name",
            ),
        )

    raw_description = first_meta(
        soup,
        (
            "description",
        ),
    )

    # ==========================================================================
    # Maker
    # ==========================================================================

    raw_maker = first_text(
        soup,
        (
            "a.no_margin",
            "a[href*='maker_id']",
        ),
    )

    if not raw_maker:

        raw_maker = first_meta(
            soup,
            (
                "brand",
            ),
        )

    # ==========================================================================
    # SKU
    # ==========================================================================

    raw_sku = first_meta(
        soup,
        (
            "sku",
        ),
    )

    if not raw_sku:

        raw_sku = first_text(
            soup,
            (
                "[itemprop='sku']",
                ".product-sku",
                ".sku",
            ),
        )

    # ==========================================================================
    # Detail URL
    # ==========================================================================

    raw_detail_url = first_attr(
        soup,
        (
            "a.product-link",
            "a[href*='/goods/']",
        ),
        "href",
    )

    # ==========================================================================
    # Commerce
    # ==========================================================================

    raw_price = first_text(
        soup,
        (
            ".search-box__price .text-red__common",
        ),
    )

    if not raw_price:

        raw_price = first_meta(
            soup,
            (
                "price",
            ),
        )

    raw_availability = first_meta(
        soup,
        (
            "availability",
        ),
    )

    # ==========================================================================
    # Stock
    # ==========================================================================

    raw_stock = first_text(
        soup,
        (
            ".search_stock_title span",
            ".search_stock_title",
        ),
    )

    # ==========================================================================
    # Shipping
    # ==========================================================================

    raw_shipping = first_text(
        soup,
        (
            ".tommorow_deliv",
        ),
    )

    # ==========================================================================
    # Media
    # ==========================================================================

    raw_image = first_attr(
        soup,
        (
            "a.product-link img",
            "img",
        ),
        "src",
    )

    if not raw_image:

        raw_image = first_meta(
            soup,
            (
                "image",
            ),
        )

    # ==========================================================================
    # Labels
    # ==========================================================================

    raw_labels = select_labels(
        soup,
    )

    # ==========================================================================
    # Summary
    # ==========================================================================

    raw_summary = first_text(
        soup,
        (
            "div.search-box__product > div > p",
            'div[itemtype="http://schema.org/Product"] + div p',
        ),
    )

    # ==========================================================================
    # Description Fallback
    # ==========================================================================

    if not raw_description:

        raw_description = raw_summary

    # ==========================================================================
    # Specifications
    # ==========================================================================

    raw_specs = select_specifications(
        soup,
    )

    # ==========================================================================
    # Category
    # ==========================================================================

    category = ""

    # ==========================================================================
    # Observation
    # ==========================================================================

    observation = {

        #
        # Catalog source
        #

        "catalog_document_key":
            document_key,

        #
        # Product Reality
        #

        "raw_title":
            raw_title,

        "raw_description":
            raw_description,

        "raw_summary":
            raw_summary,

        "raw_maker":
            raw_maker,

        "raw_sku":
            raw_sku,

        #
        # Commerce Reality
        #

        "raw_price":
            raw_price,

        "raw_stock":
            raw_stock,

        "raw_availability":
            raw_availability,

        "raw_shipping":
            raw_shipping,

        #
        # Media Reality
        #

        "raw_image":
            raw_image,

        "raw_detail_url":
            raw_detail_url,

        #
        # Published Specification Reality
        #

        "raw_specs":
            raw_specs,

        "raw_labels":
            raw_labels,

        #
        # Category
        #

        "category":
            category,

        #
        # Original Reality
        #

        "raw_html":
            card_html,

    }

    return observation


# ==============================================================================
# Runtime Constants
# ==============================================================================

DOCUMENT_INPUT = "cards"

DOCUMENT_OUTPUT = "observation"


# ==============================================================================
# Observation Identity
# ==============================================================================

def build_observation_key(
    observation: dict,
) -> str:
    """
    Build a stable product-card Observation key.

    Priority:

        raw_sku
            ↓
        raw_detail_url
            ↓
        raw_html hash

    No semantic interpretation is performed.

    The value is used only to identify the
    observed card for persistence and cache control.
    """

    raw_sku = (
        observation.get(
            "raw_sku",
            "",
        )
        or ""
    ).strip()

    if raw_sku:

        return raw_sku

    raw_detail_url = (
        observation.get(
            "raw_detail_url",
            "",
        )
        or ""
    ).strip()

    if raw_detail_url:

        return (
            "url__"
            + hashlib.sha256(
                raw_detail_url.encode(
                    "utf-8",
                ),
            ).hexdigest()[:32]
        )

    raw_html = (
        observation.get(
            "raw_html",
            "",
        )
        or ""
    )

    if raw_html:

        return (
            "html__"
            + hashlib.sha256(
                raw_html.encode(
                    "utf-8",
                ),
            ).hexdigest()[:32]
        )

    raise ValueError(
        "TSUKUMO Observation has no "
        "raw_sku, raw_detail_url, or raw_html."
    )


# ==============================================================================
# Observation Contract
# ==============================================================================

CARD_FIELDS = (

    "catalog_document_key",

    "category",

    "raw_title",

    "raw_description",

    "raw_summary",

    "raw_maker",

    "raw_sku",

    "raw_price",

    "raw_stock",

    "raw_availability",

    "raw_shipping",

    "raw_image",

    "raw_detail_url",

    "raw_specs",

    "raw_labels",

    "raw_html",

)


# ==============================================================================
# Persistence
# ==============================================================================

def save_observation(
    *,
    observation_key: str,
    observation: dict,
):

    document, created = (
        AcquisitionDocument.objects
        .update_or_create(

            source_type="scraping",

            source_name=SITE_NAME.lower(),

            document_type=DOCUMENT_OUTPUT,

            document_key=observation_key,

            defaults={

                "content_type":
                    "application/json",

                "content":
                    json.dumps(
                        observation,
                        ensure_ascii=False,
                        indent=2,
                    ),

            },

        )
    )

    return document, created


# ==============================================================================
# Cache Check
# ==============================================================================

def exists(
    observation_key: str,
) -> bool:

    return AcquisitionDocument.objects.filter(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_OUTPUT,

        document_key=observation_key,

    ).exists()


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

    print()
    print(
        "=" * 70
    )

    print(
        f"👀 {SITE_NAME} CARD OBSERVATION"
    )

    print(
        "=" * 70
    )

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

    success = 0
    failed = 0
    cached = 0
    saved = 0

    # ==========================================================================
    # Catalog Documents
    # ==========================================================================

    for document in documents:

        catalog_document_key = (
            document.document_key
        )

        print()
        print(
            f"CATALOG : {catalog_document_key}"
        )

        try:

            runtime = json.loads(
                document.content,
            )

            cards = runtime.get(
                "cards",
                [],
            )

        except Exception as exc:

            failed += 1

            print(
                "  Status : ERROR"
            )

            print(
                f"  Reason : {exc}"
            )

            continue

        print(
            f"  Cards : {len(cards)}"
        )

        # ======================================================================
        # Cards
        # ======================================================================

        for index, card in enumerate(
            cards,
            start=1,
        ):

            try:

                card_html = card.get(
                    "html",
                    "",
                )

                if not card_html:

                    raise ValueError(
                        "Card HTML is empty."
                    )

                # ------------------------------------------------------------------
                # Observe Reality
                # ------------------------------------------------------------------

                observation = observe_card(

                    document_key=
                        catalog_document_key,

                    card_html=
                        card_html,

                )

                # ------------------------------------------------------------------
                # Product Observation Key
                # ------------------------------------------------------------------

                observation_key = (
                    build_observation_key(
                        observation,
                    )
                )

                # ------------------------------------------------------------------
                # Cache
                # ------------------------------------------------------------------

                if (

                    not force

                    and exists(
                        observation_key,
                    )

                ):

                    cached += 1

                    print(
                        f"  [{index:03}] "
                        f"[CACHE] "
                        f"{observation_key}"
                    )

                    continue

                # ------------------------------------------------------------------
                # Persist
                # ------------------------------------------------------------------

                _, created = save_observation(

                    observation_key=
                        observation_key,

                    observation=
                        observation,

                )

                saved += 1

                success += 1

                print(
                    f"  [{index:03}] "
                    f"{observation_key} "
                    f""
                    f"{'CREATED' if created else 'UPDATED'}"
                )

            except Exception as exc:

                failed += 1

                print(
                    f"  [{index:03}] ERROR"
                )

                print(
                    f"    Reason : {exc}"
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
        f"SAVED  : {saved}"
    )

    print(
        f"CACHED : {cached}"
    )

    print(
        f"FAILED : {failed}"
    )

    print(
        "=" * 70
    )


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    *,
    force: bool = False,
) -> None:

    observe(
        force=force,
    )


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()