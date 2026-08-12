#!/usr/bin/env python3

# ============================================================================
#
# FILE:
# acquisition/sources/scraping/ark/formatter.py
#
# SHIN CORE LINX
#
# ARK Formatter Runtime
#
# Reality First
#
# Page Observation
#       ↓
# Product Reality
#       ↓
# Formatter Runtime
#
# ============================================================================
#
# Responsibilities
#
# - Flatten Page Observation into Product Runtime
# - Normalize presentation values
# - Preserve observed Product Reality
# - Normalize URLs
# - Normalize price
# - Preserve specifications
#
# NOT Responsibilities
#
# - HTTP Acquisition
# - HTML Parsing
# - Product Observation
# - Semantic Processing
# - Product Mapping
# - Affiliate Generation
# - Persistence
# - Product Building
#
# ============================================================================

from __future__ import annotations

from typing import Any
from urllib.parse import urljoin

from .settings import (
    BASE_URL,
    SITE_NAME,
)


# ============================================================================
# Runtime Constants
# ============================================================================

SOURCE_NAME = SITE_NAME.lower()
DOCUMENT_TYPE = "product"


# ============================================================================
# Text
# ============================================================================

def normalize_text(
    value: Any,
) -> str:

    if value is None:
        return ""

    if isinstance(
        value,
        str,
    ):
        return " ".join(
            value.split()
        ).strip()

    return str(
        value
    ).strip()


# ============================================================================
# URL
# ============================================================================

def normalize_url(
    value: Any,
) -> str:
    """
    Convert observed relative ARK URL into absolute URL.

    No URL is invented.
    """

    value = normalize_text(
        value
    )

    if not value:
        return ""

    if value.startswith(
        (
            "http://",
            "https://",
        )
    ):
        return value

    if value.startswith("//"):
        return "https:" + value

    return urljoin(
        BASE_URL.rstrip("/") + "/",
        value.lstrip("/"),
    )


# ============================================================================
# Price
# ============================================================================

def normalize_price(
    value: Any,
) -> int | None:
    """
    Normalize ARK observed price.

    Example:
        "89,800 円"
            ↓
        89800
    """

    if value is None:
        return None

    if isinstance(
        value,
        bool,
    ):
        return None

    if isinstance(
        value,
        (int, float),
    ):
        return int(
            value
        )

    value = normalize_text(
        value
    )

    if not value:
        return None

    value = (
        value
        .replace(
            ",",
            "",
        )
        .replace(
            "円",
            "",
        )
        .strip()
    )

    try:

        return int(
            float(
                value
            )
        )

    except (
        TypeError,
        ValueError,
    ):

        return None


# ============================================================================
# Product Formatter
# ============================================================================

def format_product(
    *,
    page_runtime: dict,
    product: dict,
) -> dict:
    """
    Convert one observed ARK Product Reality
    into one Formatter Runtime.
    """

    seed = page_runtime.get(
        "seed",
        {},
    )

    identity = product.get(
        "identity",
        {},
    )

    product_data = product.get(
        "product",
        {},
    )

    commerce = product.get(
        "commerce",
        {},
    )

    url = product.get(
        "url",
        {},
    )

    media = product.get(
        "media",
        {},
    )

    specifications = product.get(
        "specifications",
        {},
    )

    # ------------------------------------------------------------------------
    # Identity
    # ------------------------------------------------------------------------

    pc_id = normalize_text(
        identity.get(
            "pc_id",
            "",
        )
    )

    product_number = normalize_text(
        identity.get(
            "product_number",
            "",
        )
    )

    model_number = normalize_text(
        identity.get(
            "model_number",
            "",
        )
    )

    # ------------------------------------------------------------------------
    # Product
    # ------------------------------------------------------------------------

    product_name = normalize_text(
        product_data.get(
            "product_name",
            "",
        )
    )

    model_name = normalize_text(
        product_data.get(
            "model_name",
            "",
        )
    )

    # ------------------------------------------------------------------------
    # URLs
    # ------------------------------------------------------------------------

    product_url = normalize_url(
        url.get(
            "product_url",
            "",
        )
    )

    image_url = normalize_url(
        media.get(
            "image_url",
            "",
        )
    )

    # ------------------------------------------------------------------------
    # Specifications
    # ------------------------------------------------------------------------

    formatted_specs = {}

    if isinstance(
        specifications,
        dict,
    ):

        for key, value in specifications.items():

            key = normalize_text(
                key
            )

            if not key:
                continue

            formatted_specs[
                key
            ] = normalize_text(
                value
            )

    # ------------------------------------------------------------------------
    # Internal Reality ID
    # ------------------------------------------------------------------------

    internal_reality_id = ""

    if pc_id:

        internal_reality_id = (
            f"{SOURCE_NAME}_{pc_id}"
        )

    elif product_number:

        internal_reality_id = (
            f"{SOURCE_NAME}_{product_number}"
        )

    # ------------------------------------------------------------------------
    # Formatter Runtime
    # ------------------------------------------------------------------------

    return {

        # --------------------------------------------------------------------
        # Runtime
        # --------------------------------------------------------------------

        "document_type":
            DOCUMENT_TYPE,

        "source_name":
            SOURCE_NAME,

        "site_name":
            SITE_NAME,

        # --------------------------------------------------------------------
        # Seed / Category Context
        # --------------------------------------------------------------------

        "entry_name":
            normalize_text(
                seed.get(
                    "entry_name",
                    "",
                )
            ),

        "maker":
            normalize_text(
                seed.get(
                    "maker",
                    "",
                )
            ),

        "series":
            normalize_text(
                seed.get(
                    "series",
                    "",
                )
            ),

        "slug":
            normalize_text(
                seed.get(
                    "slug",
                    "",
                )
            ),

        "runtime":
            normalize_text(
                seed.get(
                    "runtime",
                    "",
                )
            ),

        # --------------------------------------------------------------------
        # Identity
        # --------------------------------------------------------------------

        "internal_reality_id":
            internal_reality_id,

        "source_product_id":
            pc_id,

        "pc_id":
            pc_id,

        "product_number":
            product_number,

        "model_number":
            model_number,

        # --------------------------------------------------------------------
        # Published Product
        # --------------------------------------------------------------------

        "published": {

            "product_name":
                product_name,

            "model_name":
                model_name,

            "description":
                normalize_text(
                    product.get(
                        "description",
                        "",
                    )
                ),

            "web_price":
                normalize_price(
                    commerce.get(
                        "price",
                        "",
                    )
                ),

            "raw_price":
                normalize_text(
                    commerce.get(
                        "price",
                        "",
                    )
                ),

            "url":
                product_url,

            "image_url":
                image_url,

            "specifications":
                formatted_specs,

            "release_date":
                normalize_text(
                    product.get(
                        "release_date",
                        "",
                    )
                ),

        },

        # --------------------------------------------------------------------
        # Observation Context
        # --------------------------------------------------------------------

        "page":
            page_runtime.get(
                "page",
            ),

        "request_url":
            page_runtime.get(
                "request_url",
                "",
            ),

        # --------------------------------------------------------------------
        # Original Product Reality
        # --------------------------------------------------------------------

        "observation":
            product,

    }


# ============================================================================
# Page Formatter
# ============================================================================

def format_page(
    page_runtime: dict,
) -> list[dict]:
    """
    Flatten one Page Observation.

    One page can contain multiple Product Realities.

        Page Observation
              ↓
        products[]
              ↓
        Product Formatter Runtimes
    """

    products = page_runtime.get(
        "products",
        [],
    )

    if not isinstance(
        products,
        list,
    ):
        return []

    formatted = []

    for product in products:

        if not isinstance(
            product,
            dict,
        ):
            continue

        formatted.append(
            format_product(
                page_runtime=page_runtime,
                product=product,
            )
        )

    return formatted


# ============================================================================
# Runtime
# ============================================================================

def formatter(
    *,
    runtimes: list[dict],
    **kwargs,
) -> list[dict]:
    """
    Format all ARK Page Observations.

    IMPORTANT:

        runtimes
            = Page Observations

        output
            = Product Formatter Runtimes

    Therefore:

        31 Pages
            ↓
        347 Products
            ↓
        347 Formatter Runtimes
    """

    print()
    print("=" * 70)
    print(
        f"🧹 {SITE_NAME.upper()} FORMATTER RUNTIME"
    )
    print("=" * 70)

    formatted = []

    failed = 0

    page_count = len(
        runtimes
    )

    product_count = 0

    # ------------------------------------------------------------------------
    # Page → Product
    # ------------------------------------------------------------------------

    for page_runtime in runtimes:

        products = page_runtime.get(
            "products",
            [],
        )

        if isinstance(
            products,
            list,
        ):

            product_count += len(
                products
            )

        try:

            page_formatted = format_page(
                page_runtime
            )

            formatted.extend(
                page_formatted
            )

        except Exception as exc:

            failed += 1

            print()
            print(
                "ARK FORMATTER FAILED"
            )

            print(
                f"Page : "
                f"{page_runtime.get('page', '')}"
            )

            print(
                f"Error : "
                f"{exc}"
            )

    # ------------------------------------------------------------------------
    # Result
    # ------------------------------------------------------------------------

    print()
    print("=" * 70)
    print(
        "ARK FORMATTER RESULT"
    )
    print("=" * 70)

    print(
        f"Page Observations : "
        f"{page_count}"
    )

    print(
        f"Product Realities : "
        f"{product_count}"
    )

    print(
        f"Formatter Runtimes: "
        f"{len(formatted)}"
    )

    print(
        f"Failed            : "
        f"{failed}"
    )

    print("=" * 70)

    return formatted


# ============================================================================
# Entry Point
# ============================================================================

def main(
    *,
    runtimes: list[dict],
    **kwargs,
) -> list[dict]:

    return formatter(
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