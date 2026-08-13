#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/minisforum/observe.py

SHIN CORE LINX

Minisforum Observation Runtime

AcquisitionDocument
        │
        ▼
Observation Runtime
        │
        ▼
ObservationDocument

Responsibilities

- Observe Reality
- Preserve Reality
- Produce ObservationDocument

NOT

- Formatter
- Parse Specifications
- Generate Meaning
- Classify Reality
- Infer
- Guess
- AI Processing

Reality First
Observation First
"""

from __future__ import annotations

import json
import re

from bs4 import BeautifulSoup

from api.models import (
    AcquisitionDocument,
    ObservationDocument,
)

from acquisition.common.trace.reality_trace import (
    trace,
    trace_model,
    trace_pipeline,
)

from .settings import SITE_NAME


# ==========================================================
# URL
# ==========================================================

def normalize_url(
    value: str,
) -> str:
    """
    Normalize protocol-relative URL.

    Example:

        //www.minisforum.jp/...
            ↓
        https://www.minisforum.jp/...
    """

    value = (
        value or ""
    ).strip()

    if value.startswith("//"):
        return (
            "https:"
            + value
        )

    return value


# ==========================================================
# Price Reality
# ==========================================================

def extract_price(
    value: str,
) -> int | None:
    """
    Extract explicit numeric price from
    source price text.

    Examples:

        ¥87,999から
            ↓
        87999

        ¥109,999
            ↓
        109999

    No calculation.
    No currency conversion.
    No inference.
    """

    value = (
        value or ""
    ).strip()

    if not value:
        return None

    match = re.search(
        r"¥\s*([\d,]+)",
        value,
    )

    if not match:
        return None

    number = (
        match.group(1)
        .replace(
            ",",
            "",
        )
    )

    try:
        return int(number)

    except ValueError:
        return None


def observe_price(
    soup: BeautifulSoup,
) -> dict[str, object]:
    """
    Observe explicit Minisforum price Reality.

    Minisforum Reality:

        <sale-price>
            ¥87,999から
        </sale-price>

        <compare-at-price>
            ¥109,999
        </compare-at-price>

    Preserves source text and
    normalized numeric price.

    No calculation.
    No interpretation.
    """

    # ------------------------------------------------------
    # Sale Price
    # ------------------------------------------------------

    sale_price_node = soup.select_one(
        "sale-price"
    )

    # ------------------------------------------------------
    # Regular / Compare Price
    # ------------------------------------------------------

    regular_price_node = soup.select_one(
        "compare-at-price"
    )

    # ------------------------------------------------------
    # Sale Badge
    # ------------------------------------------------------

    sale_badge = soup.select_one(
        ".product-card__badge-list .badge"
    )

    # ------------------------------------------------------
    # Source Text
    # ------------------------------------------------------

    sale_price_text = (
        sale_price_node.get_text(
            " ",
            strip=True,
        )
        if sale_price_node
        else ""
    )

    regular_price_text = (
        regular_price_node.get_text(
            " ",
            strip=True,
        )
        if regular_price_node
        else ""
    )

    sale_badge_text = (
        sale_badge.get_text(
            " ",
            strip=True,
        )
        if sale_badge
        else ""
    )

    # ------------------------------------------------------
    # Numeric Reality
    # ------------------------------------------------------

    sale_price = extract_price(
        sale_price_text
    )

    regular_price = extract_price(
        regular_price_text
    )

    return {
        "sale_price": sale_price,
        "sale_price_text": sale_price_text,
        "regular_price": regular_price,
        "regular_price_text": regular_price_text,
        "sale_badge": sale_badge_text,
    }


# ==========================================================
# Image Reality
# ==========================================================

def observe_images(
    soup: BeautifulSoup,
) -> dict[str, object]:
    """
    Observe Minisforum Product Images.

    Primary image:

        .product-gallery__media.is-selected img

    Additional images are preserved
    without semantic classification.
    """

    images: list[str] = []

    # ------------------------------------------------------
    # Main Image
    # ------------------------------------------------------

    main = soup.select_one(
        ".product-gallery__media.is-selected img"
    )

    # ------------------------------------------------------
    # Fallback Main Image
    # ------------------------------------------------------

    if main is None:

        main = soup.select_one(
            ".product-gallery__media img"
        )

    main_image = ""

    if main:

        main_image = normalize_url(
            main.get(
                "src",
                "",
            )
        )

        if main_image:

            images.append(
                main_image
            )

    # ------------------------------------------------------
    # Additional Product Gallery Images
    # ------------------------------------------------------

    for img in soup.select(
        ".product-gallery__media img"
    ):

        src = (
            img.get("src")
            or img.get("data-src")
            or ""
        )

        src = normalize_url(
            src
        )

        if (
            not src
            or src.startswith(
                "data:image"
            )
        ):
            continue

        if src not in images:

            images.append(
                src
            )

    return {
        "main_image": main_image,
        "images": images,
    }


# ==========================================================
# Feature Chart Reality
# ==========================================================

def observe_feature_chart(
    soup: BeautifulSoup,
) -> list[str]:
    """
    Preserve Minisforum Feature Chart Reality.

    Actual source structure:

        <feature-chart>

            <div class="feature-chart__table-row">

                <div class="feature-chart__heading">
                    モデル
                </div>

                <div class="feature-chart__value">
                    <p>N5 Air</p>
                </div>

            </div>

        </feature-chart>

    No specification interpretation
    is performed here.

    The complete row is preserved as
    plain structured text for later
    AI Specification Runtime processing.
    """

    tables: list[str] = []

    # ------------------------------------------------------
    # Feature Chart
    # ------------------------------------------------------

    feature_chart = soup.select_one(
        "feature-chart"
    )

    if not feature_chart:

        return tables

    # ------------------------------------------------------
    # Rows
    # ------------------------------------------------------

    rows = feature_chart.select(
        ".feature-chart__table-row"
    )

    for row in rows:

        heading = row.select_one(
            ".feature-chart__heading"
        )

        value = row.select_one(
            ".feature-chart__value"
        )

        if not heading or not value:
            continue

        heading_text = (
            heading.get_text(
                " ",
                strip=True,
            )
        )

        value_text = (
            value.get_text(
                "\n",
                strip=True,
            )
        )

        if not heading_text:
            continue

        if not value_text:
            continue

        tables.append(
            f"{heading_text}\n{value_text}"
        )

    return tables


# ==========================================================
# Generic HTML Table Reality
# ==========================================================

def observe_html_tables(
    soup: BeautifulSoup,
) -> list[str]:
    """
    Preserve ordinary HTML Table Reality.

    Minisforum primarily uses feature-chart,
    but ordinary tables are also preserved
    if present.

    No specification interpretation.
    """

    tables: list[str] = []

    for table in soup.find_all(
        "table",
    ):

        text = table.get_text(
            "\n",
            strip=True,
        )

        if not text:
            continue

        tables.append(
            text
        )

    return tables


# ==========================================================
# Combined Table / Specification Reality
# ==========================================================

def observe_tables(
    soup: BeautifulSoup,
) -> list[str]:
    """
    Observe all explicit specification
    Reality containers.

    Priority:

        1. feature-chart
        2. ordinary HTML table

    No semantic interpretation.
    """

    tables = observe_feature_chart(
        soup
    )

    html_tables = observe_html_tables(
        soup
    )

    for table in html_tables:

        if table not in tables:

            tables.append(
                table
            )

    return tables


# ==========================================================
# JSON-LD Reality
# ==========================================================

def observe_jsonld(
    soup: BeautifulSoup,
) -> list[str]:
    """
    Preserve JSON-LD exactly as
    supplied by the source page.
    """

    scripts: list[str] = []

    for script in soup.find_all(
        "script",
        type="application/ld+json",
    ):

        # --------------------------------------------------
        # script.string
        # --------------------------------------------------

        if script.string:

            scripts.append(
                script.string
            )

            continue

        # --------------------------------------------------
        # Fallback get_text
        # --------------------------------------------------

        text = script.get_text(
            "",
            strip=False,
        )

        if text:

            scripts.append(
                text
            )

    return scripts


# ==========================================================
# Product Name Reality
# ==========================================================

def observe_product_name(
    soup: BeautifulSoup,
) -> str:
    """
    Observe explicit Minisforum Product Name.

    Primary selector:

        h1

    Fallbacks are restricted to
    explicit product title elements.
    """

    selectors = (
        "h1",
        ".product-info__title",
        ".product-title",
        ".product-card__title",
    )

    for selector in selectors:

        node = soup.select_one(
            selector
        )

        if not node:
            continue

        text = node.get_text(
            " ",
            strip=True,
        )

        if text:

            return text

    return ""


# ==========================================================
# Product Description Reality
# ==========================================================

def observe_description(
    soup: BeautifulSoup,
) -> str:
    """
    Observe explicit product description.

    Priority:

        1. meta description
        2. product description container

    No summarization.
    """

    # ------------------------------------------------------
    # Meta Description
    # ------------------------------------------------------

    meta = soup.find(
        "meta",
        attrs={
            "name": "description",
        },
    )

    if meta:

        content = (
            meta.get(
                "content",
                "",
            )
            .strip()
        )

        if content:

            return content

    # ------------------------------------------------------
    # Product Description
    # ------------------------------------------------------

    selectors = (
        ".product-info__description",
        ".product-description",
        "[data-product-description]",
    )

    for selector in selectors:

        node = soup.select_one(
            selector
        )

        if not node:
            continue

        text = node.get_text(
            "\n",
            strip=True,
        )

        if text:

            return text

    return ""


# ==========================================================
# Canonical URL
# ==========================================================

def observe_canonical_url(
    soup: BeautifulSoup,
) -> str:
    """
    Observe canonical Product URL.
    """

    canonical = soup.find(
        "link",
        rel="canonical",
    )

    if canonical:

        return normalize_url(
            canonical.get(
                "href",
                "",
            )
        )

    return ""


# ==========================================================
# JSON-LD URL Fallback
# ==========================================================

def observe_jsonld_url(
    scripts: list[str],
) -> str:
    """
    Extract explicit URL from JSON-LD
    when canonical URL is unavailable.

    No semantic interpretation.
    """

    for script in scripts:

        try:

            data = json.loads(
                script
            )

        except Exception:

            continue

        # --------------------------------------------------
        # Direct Object
        # --------------------------------------------------

        if isinstance(
            data,
            dict,
        ):

            if data.get(
                "url"
            ):

                return normalize_url(
                    data["url"]
                )

            # ----------------------------------------------
            # @graph
            # ----------------------------------------------

            graph = data.get(
                "@graph"
            )

            if isinstance(
                graph,
                list,
            ):

                for node in graph:

                    if not isinstance(
                        node,
                        dict,
                    ):
                        continue

                    if node.get(
                        "url"
                    ):

                        return normalize_url(
                            node["url"]
                        )

        # --------------------------------------------------
        # JSON-LD List
        # --------------------------------------------------

        elif isinstance(
            data,
            list,
        ):

            for node in data:

                if not isinstance(
                    node,
                    dict,
                ):
                    continue

                if node.get(
                    "url"
                ):

                    return normalize_url(
                        node["url"]
                    )

    return ""


# ==========================================================
# Observation
# ==========================================================

def observe(
    html: str,
) -> dict[str, object]:
    """
    Observe Minisforum Product HTML.

    Extract only explicit source Reality.

    No inference.
    No classification.
    No semantic generation.
    No AI processing.
    """

    trace_pipeline(
        "Observation"
    )

    trace(
        "Observation Input",
        {
            "html_length": len(
                html
            ),
        },
    )

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    # ======================================================
    # JSON-LD
    # ======================================================

    scripts = observe_jsonld(
        soup
    )

    # ======================================================
    # Identity
    # ======================================================

    title = ""

    if soup.title:

        title = soup.title.get_text(
            strip=True,
        )

    product_name = (
        observe_product_name(
            soup
        )
    )

    url = (
        observe_canonical_url(
            soup
        )
    )

    # ======================================================
    # URL Fallback
    # ======================================================

    if not url:

        url = observe_jsonld_url(
            scripts
        )

    # ======================================================
    # Description
    # ======================================================

    description = (
        observe_description(
            soup
        )
    )

    # ======================================================
    # Commerce
    # ======================================================

    price = observe_price(
        soup
    )

    # ======================================================
    # Images
    # ======================================================

    image_result = observe_images(
        soup
    )

    # ======================================================
    # Feature / Table Reality
    # ======================================================

    tables = observe_tables(
        soup
    )

    # ======================================================
    # Reality Snapshot
    # ======================================================

    result: dict[str, object] = {

        # --------------------------------------------------
        # Identity
        # --------------------------------------------------

        "title": title,

        "product_name": product_name,

        "url": url,

        "description": description,

        # --------------------------------------------------
        # Commerce
        # --------------------------------------------------

        "price": price[
            "sale_price"
        ],

        "price_text": price[
            "sale_price_text"
        ],

        "regular_price": price[
            "regular_price"
        ],

        "regular_price_text": price[
            "regular_price_text"
        ],

        "sale_label": price[
            "sale_badge"
        ],

        # --------------------------------------------------
        # Media
        # --------------------------------------------------

        "main_image": image_result[
            "main_image"
        ],

        "images": image_result[
            "images"
        ],

        # --------------------------------------------------
        # Reality
        # --------------------------------------------------

        "tables": tables,

        "scripts": scripts,
    }

    # ======================================================
    # Trace
    # ======================================================

    trace(
        "Observation Result",
        {
            "title": result[
                "title"
            ],

            "product_name": result[
                "product_name"
            ],

            "url": result[
                "url"
            ],

            "description": bool(
                result[
                    "description"
                ]
            ),

            "price": result[
                "price"
            ],

            "price_text": result[
                "price_text"
            ],

            "regular_price": result[
                "regular_price"
            ],

            "regular_price_text": result[
                "regular_price_text"
            ],

            "sale_label": result[
                "sale_label"
            ],

            "main_image": result[
                "main_image"
            ],

            "images": len(
                result[
                    "images"
                ]
            ),

            "tables": len(
                result[
                    "tables"
                ]
            ),

            "jsonld": len(
                result[
                    "scripts"
                ]
            ),
        },
    )

    return result


# ==========================================================
# Runtime
# ==========================================================

def run() -> None:
    """
    Execute Minisforum Observation Runtime.

    Raw Product HTML
            ↓
        Observation
            ↓
    ObservationDocument
    """

    print(
        "=" * 60
    )

    print(
        "👀 MINISFORUM OBSERVATION"
    )

    print(
        "=" * 60
    )

    trace_pipeline(
        "Observation"
    )

    # ======================================================
    # Product Documents
    # ======================================================

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_type="scraping",
            source_name=SITE_NAME,
            document_type="product",
        )
        .exclude(
            content="",
        )
        .iterator()
    )

    success = 0

    # ======================================================
    # Observation Loop
    # ======================================================

    for document in documents:

        trace(
            "Observation Document",
            {
                "key": document.document_key,
            },
        )

        # --------------------------------------------------
        # Raw Reality
        # --------------------------------------------------

        observation = observe(
            document.content,
        )

        # --------------------------------------------------
        # ObservationDocument
        # --------------------------------------------------

        obj, _ = (
            ObservationDocument.objects
            .update_or_create(

                source_name=(
                    document.source_name
                ),

                document_type=(
                    document.document_type
                ),

                document_key=(
                    document.document_key
                ),

                defaults={
                    "observation": observation,
                },
            )
        )

        trace_model(
            "ObservationDocument",
            obj,
        )

        success += 1

    # ======================================================
    # Result
    # ======================================================

    print(
        "=" * 60
    )

    print(
        f"SUCCESS : {success}"
    )

    print(
        "=" * 60
    )


# ==========================================================
# Main
# ==========================================================

def main() -> None:
    run()


# ==========================================================
# Standalone Execution
# ==========================================================

if __name__ == "__main__":
    main()