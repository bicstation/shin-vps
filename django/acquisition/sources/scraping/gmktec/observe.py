#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/gmktec/observe.py

SHIN CORE LINX

GMKtec Observation Runtime

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

        //jp.gmktec.com/...
            ↓
        https://jp.gmktec.com/...
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

def observe_price(
    soup: BeautifulSoup,
) -> dict[str, str]:
    """
    Observe explicit GMKtec price Reality.

    Preserves source text.

    No calculation.
    No interpretation.
    """

    sale_price = soup.select_one(
        ".price-item--sale"
    )

    regular_price = soup.select_one(
        ".price-item--regular"
    )

    sale_badge = soup.select_one(
        ".sale-badge"
    )

    return {
        "sale_price": (
            sale_price.get_text(
                " ",
                strip=True,
            )
            if sale_price
            else ""
        ),
        "regular_price": (
            regular_price.get_text(
                " ",
                strip=True,
            )
            if regular_price
            else ""
        ),
        "sale_badge": (
            sale_badge.get_text(
                " ",
                strip=True,
            )
            if sale_badge
            else ""
        ),
    }


# ==========================================================
# Image Reality
# ==========================================================

def observe_images(
    soup: BeautifulSoup,
) -> dict[str, object]:
    """
    Observe GMKtec Product Images.

    Primary image:

        img.product-preview-image

    Additional images are preserved
    without semantic classification.
    """

    images: list[str] = []

    # ------------------------------------------------------
    # Main Image
    # ------------------------------------------------------

    main = soup.select_one(
        "img.product-preview-image"
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
    # Additional Images
    # ------------------------------------------------------

    for img in soup.select(
        "img",
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
# Table Reality
# ==========================================================

def observe_tables(
    soup: BeautifulSoup,
) -> list[str]:
    """
    Preserve HTML Table Reality.

    No specification interpretation
    is performed here.
    """

    return [
        table.get_text(
            "\n",
            strip=True,
        )
        for table in soup.find_all(
            "table",
        )
    ]


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

        if not script.string:
            continue

        scripts.append(
            script.string
        )

    return scripts


# ==========================================================
# Observation
# ==========================================================

def observe(
    html: str,
) -> dict[str, object]:
    """
    Observe GMKtec Product HTML.

    Extract only explicit source Reality.

    No inference.
    No classification.
    No semantic generation.
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
    # Reality Snapshot
    # ======================================================

    result: dict[str, object] = {

        # --------------------------------------------------
        # Identity
        # --------------------------------------------------

        "title": "",

        "product_name": "",

        "url": "",

        "description": "",

        # --------------------------------------------------
        # Commerce
        # --------------------------------------------------

        "price": "",

        "regular_price": "",

        "sale_label": "",

        # --------------------------------------------------
        # Media
        # --------------------------------------------------

        "main_image": "",

        "images": [],

        # --------------------------------------------------
        # Reality
        # --------------------------------------------------

        "tables": [],

        "scripts": [],
    }

    # ======================================================
    # HTML Title
    # ======================================================

    if soup.title:

        result["title"] = (
            soup.title.get_text(
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
            product_title.get_text(
                " ",
                strip=True,
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
            meta.get(
                "content",
                "",
            ).strip()
        )

    # ======================================================
    # Commerce
    # ======================================================

    price = observe_price(
        soup
    )

    result["price"] = (
        price["sale_price"]
    )

    result["regular_price"] = (
        price["regular_price"]
    )

    result["sale_label"] = (
        price["sale_badge"]
    )

    # ======================================================
    # Images
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
    # Tables
    # ======================================================

    result["tables"] = observe_tables(
        soup
    )

    # ======================================================
    # JSON-LD
    # ======================================================

    result["scripts"] = observe_jsonld(
        soup
    )

    # ======================================================
    # JSON-LD URL Fallback
    # ======================================================

    if not result["url"]:

        for script in result["scripts"]:

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

            # ------------------------------------------------
            # Direct URL
            # ------------------------------------------------

            if data.get(
                "url"
            ):

                result["url"] = (
                    data["url"]
                )

                break

            # ------------------------------------------------
            # @graph
            # ------------------------------------------------

            graph = data.get(
                "@graph"
            )

            if isinstance(
                graph,
                list,
            ):

                for node in graph:

                    if (
                        isinstance(
                            node,
                            dict,
                        )
                        and node.get(
                            "url"
                        )
                    ):

                        result["url"] = (
                            node["url"]
                        )

                        break

                if result["url"]:
                    break

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
            "regular_price": (
                result["regular_price"]
            ),
            "sale_label": (
                result["sale_label"]
            ),
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
        AcquisitionDocument.objects.filter(
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
            ObservationDocument.objects.update_or_create(

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