#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/gmktec/observe.py

SHIN CORE LINX

GMKtec Observation Runtime

AcquisitionDocument
        │
        ▼
Formatter Runtime
        │
        ▼
Observation Runtime
        │
        ▼
ObservationDocument

Responsibilities

- Observe Reality
- Preserve observable Reality
- Remove unnecessary HTML structure
- Organize Reality for downstream AI analysis
- Produce ObservationDocument

NOT

- HTML Storage
- Formatter
- Parse Specifications
- Generate Semantic Meaning
- Classify Specification Meaning
- Infer
- Guess
- Calculate specifications
- AI Processing

Important Principle

Observation is not Semantic Interpretation.

The Runtime may organize observable Reality
into readable structural fields such as:

- title
- product_name
- url
- description
- price
- main_image
- images
- tables
- scripts

Commerce Reality such as price may be normalized
into its concrete numeric representation.

Specification meaning MUST remain unclassified.

Example:

    "AMD Ryzen 7 8845HS"
    "32GB"
    "1TB"

must remain observable source content.

Do NOT convert them into:

    cpu_model
    memory_gb
    storage_gb

Those meanings belong to downstream AI analysis.

Reality First
Observation First
Meaning Later
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
    Normalize URL representation only.

    No semantic interpretation.
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
# Text
# ==========================================================

def normalize_text(
    value: str,
) -> str:
    """
    Normalize observable text representation.

    This does NOT interpret meaning.

    It only:

    - normalizes whitespace
    - removes unnecessary surrounding whitespace
    - preserves textual content
    """

    if not isinstance(
        value,
        str,
    ):
        return value

    lines = [
        line.rstrip()
        for line in value.replace(
            "\r\n",
            "\n",
        ).replace(
            "\r",
            "\n",
        ).split("\n")
    ]

    result: list[str] = []

    previous_empty = False

    for line in lines:

        empty = (
            line.strip() == ""
        )

        if (
            empty
            and previous_empty
        ):
            continue

        result.append(
            line
        )

        previous_empty = empty

    return "\n".join(
        result
    ).strip()


# ==========================================================
# Price Reality
# ==========================================================

def normalize_price(
    value: str,
) -> int:
    """
    Normalize observed price into integer JPY.

    Example:

        ¥43,999 JPY
            ↓
        43999

    This is Commerce Reality normalization.

    It does NOT:

    - infer specifications
    - classify product meaning
    - calculate prices
    - compare prices
    - select between products
    """

    if not isinstance(
        value,
        str,
    ):
        return 0

    digits = re.sub(
        r"[^\d]",
        "",
        value,
    )

    if not digits:
        return 0

    return int(
        digits
    )

def observe_price(
    soup: BeautifulSoup,
) -> int:
    """
    Observe the visible product price.

    Price is Commerce Reality.

    This function does NOT:
    - calculate price
    - select among product variants
    - infer price
    - classify specifications

    It observes the price displayed
    in the product's main price container.
    """

    price_node = soup.select_one(
        ".product-price .price-item"
    )

    if not price_node:
        return 0

    text = normalize_text(
        price_node.get_text(
            " ",
            strip=True,
        )
    )

    # --------------------------------------------------
    # Numeric representation
    #
    # Example:
    # ¥71,248 JPY
    #        ↓
    # 71248
    # --------------------------------------------------

    digits = re.sub(
        r"[^\d]",
        "",
        text,
    )

    if not digits:
        return 0

    return int(
        digits,
    )



# ==========================================================
# Image Reality
# ==========================================================

def extract_image_url(
    img,
) -> str:
    """
    Extract observable image URL.

    No image classification.
    """

    src = (
        img.get("src")
        or img.get("data-src")
        or img.get("data-original")
        or ""
    )

    return normalize_url(
        src
    )


def observe_images(
    soup: BeautifulSoup,
) -> dict[str, object]:
    """
    Observe product image Reality.

    Prefer product-specific image structures.

    Do NOT classify images semantically.

    Avoid unrelated page assets such as:

    - transparent placeholders
    - site logos
    - navigation images
    - unrelated page graphics

    If product-gallery structure exists,
    use it.

    Otherwise fall back to product preview
    images only.
    """

    images: list[str] = []

    # ======================================================
    # Main Product Image
    # ======================================================

    main = soup.select_one(
        "img.product-preview-image"
    )

    main_image = ""

    if main:

        main_image = extract_image_url(
            main
        )

        if (
            main_image
            and not main_image.startswith(
                "data:image"
            )
        ):

            images.append(
                main_image
            )

    # ======================================================
    # Product Gallery
    # ======================================================

    gallery_selectors = [

        ".product-gallery img",

        ".product__media img",

        ".product-gallery__media img",

        ".product-single__media img",

        "[data-media-type='image'] img",

        "img.product-preview-image",

    ]

    gallery_found = False

    for selector in gallery_selectors:

        candidates = soup.select(
            selector
        )

        if not candidates:
            continue

        gallery_found = True

        for img in candidates:

            src = extract_image_url(
                img
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

    # ======================================================
    # Fallback
    # ======================================================

    if not gallery_found:

        for img in soup.select(
            "img.product-preview-image"
        ):

            src = extract_image_url(
                img
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
# Table Reality
# ==========================================================

def observe_tables(
    soup: BeautifulSoup,
) -> list[str]:
    """
    Preserve visible table Reality.

    The table is converted from HTML structure
    into readable text.

    No specification interpretation.
    """

    tables: list[str] = []

    for table in soup.find_all(
        "table"
    ):

        text = normalize_text(
            table.get_text(
                "\n",
                strip=True,
            )
        )

        if not text:
            continue

        tables.append(
            text
        )

    return tables


# ==========================================================
# JSON-LD Reality
# ==========================================================

def observe_jsonld(
    soup: BeautifulSoup,
) -> list[str]:
    """
    Preserve JSON-LD Reality.

    The surrounding <script> HTML element
    is removed.

    The JSON-LD content itself is preserved.

    No semantic interpretation is performed.
    """

    scripts: list[str] = []

    for script in soup.find_all(
        "script",
        type="application/ld+json",
    ):

        if not script.string:
            continue

        value = (
            script.string
            .strip()
        )

        if not value:
            continue

        scripts.append(
            value
        )

    return scripts


# ==========================================================
# JSON-LD URL
# ==========================================================

def observe_jsonld_url(
    scripts: list[str],
) -> str:
    """
    Find explicit URL from JSON-LD.

    This is only a URL fallback.

    No semantic classification.
    """

    for script in scripts:

        try:

            data = json.loads(
                script
            )

        except Exception:

            continue

        if not isinstance(
            data,
            dict,
        ):
            continue

        # --------------------------------------------------
        # Direct URL
        # --------------------------------------------------

        url = data.get(
            "url"
        )

        if isinstance(
            url,
            str,
        ) and url:

            return normalize_url(
                url
            )

        # --------------------------------------------------
        # @graph
        # --------------------------------------------------

        graph = data.get(
            "@graph"
        )

        if not isinstance(
            graph,
            list,
        ):
            continue

        for node in graph:

            if not isinstance(
                node,
                dict,
            ):
                continue

            url = node.get(
                "url"
            )

            if isinstance(
                url,
                str,
            ) and url:

                return normalize_url(
                    url
                )

    return ""


# ==========================================================
# Observation
# ==========================================================

def observe(
    html: str,
) -> dict[str, object]:
    """
    Observe GMKtec Product Reality.

    The purpose of this Runtime is to produce
    an AI-readable Observation without destroying
    observable Reality.

    The Runtime:

    - removes HTML structural representation
    - preserves source text
    - preserves Commerce Reality
    - normalizes price into numeric JPY
    - preserves product image Reality
    - preserves table Reality
    - preserves JSON-LD Reality
    - preserves product identity information

    The Runtime does NOT:

    - interpret specifications
    - classify CPU/GPU/memory/storage
    - calculate specifications
    - infer missing information
    - guess product properties
    - generate semantic meaning
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

    # ======================================================
    # Parse HTML
    # ======================================================

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    # ======================================================
    # Reality Snapshot
    # ======================================================

    result: dict[str, object] = {

        # --------------------------------------------------
        # Identity Reality
        # --------------------------------------------------

        "title": "",

        "product_name": "",

        "url": "",

        # --------------------------------------------------
        # Description Reality
        # --------------------------------------------------

        "description": "",

        # --------------------------------------------------
        # Commerce Reality
        # --------------------------------------------------

        "price": 0,

        # --------------------------------------------------
        # Media Reality
        # --------------------------------------------------

        "main_image": "",

        "images": [],

        # --------------------------------------------------
        # Unclassified Product Reality
        # --------------------------------------------------

        "tables": [],

        "scripts": [],
    }

    # ======================================================
    # HTML Title
    # ======================================================

    if soup.title:

        result["title"] = normalize_text(
            soup.title.get_text(
                " ",
                strip=True,
            )
        )

    # ======================================================
    # Product Name
    # ======================================================

    product_title = soup.select_one(
        "h1.product-title-heading"
    )

    if product_title:

        result["product_name"] = (
            normalize_text(
                product_title.get_text(
                    " ",
                    strip=True,
                )
            )
        )

    # ======================================================
    # Canonical URL
    # ======================================================

    canonical = soup.find(
        "link",
        rel="canonical",
    )

    if canonical:

        result["url"] = normalize_url(
            canonical.get(
                "href",
                "",
            )
        )

    # ======================================================
    # Meta Description
    # ======================================================

    meta = soup.find(
        "meta",
        attrs={
            "name": "description",
        },
    )

    if meta:

        result["description"] = (
            normalize_text(
                meta.get(
                    "content",
                    "",
                )
            )
        )

    # ======================================================
    # Price Reality
    # ======================================================

    result["price"] = observe_price(
        soup
    )

    # ======================================================
    # Image Reality
    # ======================================================

    image_result = observe_images(
        soup
    )

    result["main_image"] = (
        image_result["main_image"]
    )

    result["images"] = (
        image_result["images"]
    )

    # ======================================================
    # Table Reality
    # ======================================================

    result["tables"] = observe_tables(
        soup
    )

    # ======================================================
    # JSON-LD Reality
    # ======================================================

    result["scripts"] = observe_jsonld(
        soup
    )

    # ======================================================
    # JSON-LD URL Fallback
    # ======================================================

    if not result["url"]:

        jsonld_url = (
            observe_jsonld_url(
                result["scripts"]
            )
        )

        if jsonld_url:

            result["url"] = (
                jsonld_url
            )

    # ======================================================
    # Trace
    # ======================================================

    trace(
        "Observation Result",
        {
            "title": result["title"],

            "product_name": (
                result["product_name"]
            ),

            "url": result["url"],

            "description": bool(
                result["description"]
            ),

            "price": result["price"],

            "main_image": (
                result["main_image"]
            ),

            "images": len(
                result["images"]
            ),

            "tables": len(
                result["tables"]
            ),

            "jsonld": len(
                result["scripts"]
            ),
        },
    )

    return result


# ==========================================================
# Runtime
# ==========================================================

def run() -> None:
    """
    Execute GMKtec Observation Runtime.

    AcquisitionDocument
            ↓
        Formatter
            ↓
        Observation
            ↓
    ObservationDocument
            ↓
        Mapper
            ↓
    observation_runtime
            ↓
       AI Analysis
    """

    print(
        "=" * 60
    )

    print(
        "👀 GMKTEC OBSERVATION"
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
        # Product Reality
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