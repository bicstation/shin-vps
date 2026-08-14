#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/lenovo/formatter_openapi.py

SHIN CORE LINX

LENOVO OpenAPI Formatter Runtime

AcquisitionDocument
        │
        ▼
OpenAPI Reality
        │
        ▼
Formatter
        │
        ▼
Runtime Contract

Reality First
Observation First
Translation Authority

Responsibilities

- Load AcquisitionDocument
- Parse OpenAPI Reality
- Normalize Runtime Values
- Preserve Published Reality
- Resolve Runtime URLs
- Resolve Main Image
- Normalize Published Identity
- Normalize Published Commerce
- Normalize Published Specifications
- Produce Runtime Contract

NOT Responsibilities

- HTTP Acquisition
- HTML Parsing
- Semantic Classification
- CPU/GPU Interpretation
- Product Mapping
- Affiliate Generation
- ImportDocument Persistence
- PCProduct Construction

==============================================================================

Design Principle

Formatter prepares Reality.

Formatter does NOT decide product meaning.

==============================================================================

Contract Policy

OpenAPI Reality may use camelCase field names.

Formatter translates those published field names
into the canonical Runtime Contract.

Example

OpenAPI Reality
    productCode
    productName
    machineType
    webPrice
    finalPrice
    taxPrice
    beforeTaxPrice

Runtime Contract
    product_code
    product_name
    machine_type
    web_price
    final_price
    tax_price
    before_tax_price

No semantic inference is performed.

==============================================================================

Observation Policy

Lenovo OpenAPI provides product specification Reality
through classification[].

The published classification structure is preserved
in raw Reality.

When the published specifications[] field is empty,
classification[] is translated into UI-ready
Observation specifications.

No semantic interpretation is performed.

Mapping:

    a             → label
    b             → value
    mediaIcon     → media_icon
    mediaIconAlt  → media_icon_alt
    gamingIcon    → gaming_icon
    gamingIconAlt → gaming_icon_alt
    c             → c
    webExclusive  → web_exclusive

The meaning of c and webExclusive is intentionally
not interpreted by Formatter.
============================================================================== 
"""

from __future__ import annotations


import json

from typing import (
    Any,
)

from urllib.parse import (
    urljoin,
)


from api.models import (
    AcquisitionDocument,
)


from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)


from .settings import (
    SITE_NAME,
    SOURCE_NAME,
    BASE_URL,
    LOCALE_PREFIX,
)


# ==============================================================================
# Runtime Constants
# ==============================================================================

DOCUMENT_TYPE = "product"

CONTENT_TYPE = "application/json"

DEFAULT_IMAGE_BASE_URL = (
    "https://www.lenovo.com"
)


# ==============================================================================
# Runtime Base URL
# ==============================================================================

def get_runtime_base_url() -> str:
    """
    Build Lenovo Japan Runtime Base URL.
    """

    return (
        BASE_URL.rstrip("/")
        + "/"
        + LOCALE_PREFIX.strip("/")
    )


# ==============================================================================
# Generic Normalization
# ==============================================================================

def normalize_text(
    value: Any,
) -> str:
    """
    Normalize published text.

    No semantic transformation.
    """

    if value is None:

        return ""

    if isinstance(
        value,
        str,
    ):

        return " ".join(
            value.split()
        )

    return str(
        value
    ).strip()


def normalize_list(
    value: Any,
) -> list:
    """
    Normalize a Runtime value into list.
    """

    if value is None:

        return []

    if isinstance(
        value,
        list,
    ):

        return value

    if isinstance(
        value,
        tuple,
    ):

        return list(
            value
        )

    return [
        value
    ]


def normalize_dict(
    value: Any,
) -> dict:
    """
    Normalize a Runtime value into dict.
    """

    if isinstance(
        value,
        dict,
    ):

        return value

    return {}


# ==============================================================================
# Reality Value Access
# ==============================================================================

def text(
    reality: dict,
    key: str,
) -> str:
    """
    Read and normalize a published text value.
    """

    return normalize_text(

        reality.get(
            key
        )

    )


def value(
    reality: dict,
    key: str,
) -> Any:
    """
    Read a published Reality value.

    Preserve original value.
    """

    return reality.get(
        key
    )


# ==============================================================================
# URL Normalization
# ==============================================================================

def normalize_url(
    value: Any,
    *,
    base_url: str = "",
) -> str:
    """
    Normalize published URL.

    Rules

    Absolute URL
        preserve

    Relative URL
        resolve against base_url

    Protocol-relative URL
        resolve as HTTPS

    Empty value
        return ""

    No semantic transformation.
    """

    value = normalize_text(
        value
    )

    if not value:

        return ""

    #
    # Protocol-relative URL
    #

    if value.startswith(
        "//"
    ):

        return (
            "https:"
            + value
        )

    #
    # Absolute URL
    #

    if value.startswith(
        (
            "http://",
            "https://",
        )
    ):

        return value

    #
    # Relative URL
    #

    if not base_url:

        base_url = (
            DEFAULT_PRODUCT_BASE_URL
        )

    return urljoin(
        base_url,
        value,
    )


def resolve_product_url(
    value: Any,
) -> str:
    """
    Resolve Lenovo Japan product URL.

    Absolute URL
        preserve as published.

    Relative URL
        resolve against Lenovo Japan Runtime Base.

    Runtime Base:

        https://www.lenovo.com/jp/ja
    """

    value = normalize_text(
        value
    )

    if not value:

        return ""

    #
    # Absolute URL
    #

    if value.startswith(
        (
            "http://",
            "https://",
        )
    ):

        return value

    #
    # Protocol-relative URL
    #

    if value.startswith(
        "//"
    ):

        return (
            "https:"
            + value
        )

    #
    # Relative Lenovo product path
    #

    base_url = get_runtime_base_url()

    return urljoin(
        base_url.rstrip("/") + "/",
        value.lstrip("/"),
    )


def resolve_image_url(
    value: Any,
) -> str:
    """
    Resolve Lenovo image URL.

    Protocol-relative image URLs
    become HTTPS URLs.
    """

    return normalize_url(

        value,

        base_url=DEFAULT_IMAGE_BASE_URL,

    )


# ==============================================================================
# AcquisitionDocument Reality Loader
# ==============================================================================

def load_reality(
    document: AcquisitionDocument,
) -> dict:
    """
    Load Lenovo OpenAPI Reality
    from AcquisitionDocument.
    """

    if not document.content:

        raise ValueError(

            "Empty AcquisitionDocument: "

            f"{document.document_key}"

        )

    try:

        reality = json.loads(

            document.content

        )

    except json.JSONDecodeError as exc:

        raise ValueError(

            "Invalid Lenovo OpenAPI JSON: "

            f"{document.document_key}"

        ) from exc

    if not isinstance(
        reality,
        dict,
    ):

        raise ValueError(

            "Lenovo OpenAPI Reality "
            "must be a dictionary: "

            f"{document.document_key}"

        )

    return reality


# ==============================================================================
# Media Normalization
# ==============================================================================

def normalize_media(
    value: Any,
) -> dict:
    """
    Preserve published Media Reality.

    No semantic transformation.
    """

    return normalize_dict(
        value
    )


def extract_image_address(
    value: Any,
) -> str:
    """
    Extract and normalize imageAddress.
    """

    if isinstance(
        value,
        str,
    ):

        return resolve_image_url(
            value
        )

    if not isinstance(
        value,
        dict,
    ):

        return ""

    image_address = value.get(
        "imageAddress",
        "",
    )

    return resolve_image_url(
        image_address
    )


def resolve_main_image(
    media: dict,
) -> str:
    """
    Resolve Main Image.

    Priority

    1. heroImage
    2. thumbnail
    3. first gallery image

    No semantic inference.
    """

    media = normalize_media(
        media
    )

    #
    # Hero
    #

    hero_image = media.get(
        "heroImage",
        {},
    )

    image_url = extract_image_address(
        hero_image
    )

    if image_url:

        return image_url

    #
    # Thumbnail
    #

    thumbnail = media.get(
        "thumbnail",
        {},
    )

    image_url = extract_image_address(
        thumbnail
    )

    if image_url:

        return image_url

    #
    # Gallery
    #

    gallery = normalize_list(
        media.get(
            "gallery",
            [],
        )
    )

    for item in gallery:

        image_url = extract_image_address(
            item
        )

        if image_url:

            return image_url

    return ""


# ==============================================================================
# Price Normalization
# ==============================================================================

def price_value(
    reality: dict,
    key: str,
) -> int:
    """
    Normalize Lenovo published price.

    Lenovo OpenAPI returns price values
    as numeric strings.

    Runtime Contract stores price
    as integer yen.
    """

    value = reality.get(
        key
    )

    if value is None:

        return 0

    if isinstance(
        value,
        str,
    ):

        value = value.strip()

    if not value:

        return 0

    return int(
        float(value)
    )


# ==============================================================================
# Lenovo Specification Observation
# ==============================================================================

def normalize_classification(
    value: Any,
) -> list[dict]:
    """
    Normalize Lenovo classification Reality
    into UI-ready Observation specifications.

    Lenovo OpenAPI classification structure:

        a
        b
        mediaIcon
        mediaIconAlt
        gamingIcon
        gamingIconAlt
        c
        webExclusive

    No semantic interpretation is performed.

    The original meaning of c and webExclusive
    is intentionally preserved without inference.
    """

    classification = normalize_list(
        value
    )

    specifications: list[dict] = []

    for item in classification:

        if not isinstance(
            item,
            dict,
        ):

            continue

        specifications.append({

            "label":
                normalize_text(
                    item.get(
                        "a",
                        "",
                    )
                ),

            "value":
                normalize_text(
                    item.get(
                        "b",
                        "",
                    )
                ),

            "media_icon":
                normalize_text(
                    item.get(
                        "mediaIcon",
                        "",
                    )
                ),

            "media_icon_alt":
                normalize_text(
                    item.get(
                        "mediaIconAlt",
                        "",
                    )
                ),

            "gaming_icon":
                normalize_text(
                    item.get(
                        "gamingIcon",
                        "",
                    )
                ),

            "gaming_icon_alt":
                normalize_text(
                    item.get(
                        "gamingIconAlt",
                        "",
                    )
                ),

            "c":
                item.get(
                    "c",
                ),

            "web_exclusive":
                item.get(
                    "webExclusive",
                ),

        })

    return specifications


# ==============================================================================
# Published Reality Formatter
# ==============================================================================

def build_published(
    reality: dict,
    *,
    source_url: str = "",
) -> dict:
    """
    Build canonical Published Runtime.

    OpenAPI Reality is translated structurally
    into the Formatter Runtime Contract.

    No semantic inference.
    """

    media = normalize_media(
        reality.get(
            "media",
            {},
        )
    )

    product_url = resolve_product_url(

        reality.get(
            "url",
            "",
        ),

    )

    image_url = resolve_main_image(
        media
    )

    #
    # Existing published specifications
    # are preserved when available.
    #

    specifications = normalize_list(
        reality.get(
            "specifications",
            [],
        )
    )

    #
    # Lenovo OpenAPI may publish product
    # specifications through classification[].
    #
    # Only use classification as the
    # Observation source when specifications
    # are not already available.
    #

    if not specifications:

        specifications = normalize_classification(
            reality.get(
                "classification",
                [],
            )
        )

    category_path = normalize_list(
        reality.get(
            "category_path",
            [],
        )
    )

    return {

        # ------------------------------------------------------------------
        # Identity Reality
        # ------------------------------------------------------------------

        "product_code":
            text(
                reality,
                "productCode",
            ),

        "product_name":
            text(
                reality,
                "productName",
            ),

        "model":
            text(
                reality,
                "model",
            ),

        "machine_type":
            text(
                reality,
                "machineType",
            ),

        "description":
            text(
                reality,
                "description",
            ),

        # ------------------------------------------------------------------
        # URL Reality
        # ------------------------------------------------------------------

        "url":
            product_url,

        "source_url":
            normalize_url(
                source_url,
            ),

        # ------------------------------------------------------------------
        # Commerce Reality
        #
        # IMPORTANT:
        # Lenovo OpenAPI Reality uses camelCase.
        # Formatter translates it into canonical Runtime names.
        # ------------------------------------------------------------------

        "web_price":
            price_value(
                reality,
                "webPrice",
            ),

        "final_price":
            price_value(
                reality,
                "finalPrice",
            ),

        "tax_price":
            price_value(
                reality,
                "taxPrice",
            ),

        "before_tax_price":
            price_value(
                reality,
                "beforeTaxPrice",
            ),

        "marketing_status":
            text(
                reality,
                "marketingStatus",
            ),

        "inventory_status":
            text(
                reality,
                "inventoryStatus",
            ),

        "lead_time":
            text(
                reality,
                "leadTime",
            ),

        # ------------------------------------------------------------------
        # Media Reality
        # ------------------------------------------------------------------

        "image_url":
            image_url,

        "media":
            media,

        # ------------------------------------------------------------------
        # Specification Reality
        # ------------------------------------------------------------------

        "specifications":
            specifications,

        # ------------------------------------------------------------------
        # Category Reality
        # ------------------------------------------------------------------

        "category_path":
            category_path,

        "manual_subseries_code":
            text(
                reality,
                "manualSubseriesCode",
            ),

        "parent_subseries_id":
            text(
                reality,
                "parentSubseriesId",
            ),

        # ------------------------------------------------------------------
        # Original Reality
        # ------------------------------------------------------------------

        "raw":
            reality,

    }


# ==============================================================================
# Runtime Contract Builder
# ==============================================================================

def build_runtime(
    document: AcquisitionDocument,
) -> dict:
    """
    Build Formatter Runtime Contract
    from one AcquisitionDocument.
    """

    reality = load_reality(
        document
    )

    source_url = normalize_url(
        document.source_url,
    )

    published = build_published(

        reality,

        source_url=source_url,

    )

    return {

        "source_name":
            SOURCE_NAME,

        "document_type":
            document.document_type,

        "document_key":
            document.document_key,

        "source_url":
            source_url,

        "published":
            published,

    }


# ==============================================================================
# Runtime Validation
# ==============================================================================

def validate_runtime(
    runtime: dict,
) -> None:
    """
    Validate Formatter Runtime structure.

    Structural validation only.
    """

    required = (

        "source_name",

        "document_type",

        "document_key",

        "source_url",

        "published",

    )

    missing = [

        field

        for field in required

        if field not in runtime

    ]

    if missing:

        raise ValueError(

            "Formatter Runtime missing fields: "

            + ", ".join(
                missing
            )

        )

    published = runtime.get(
        "published",
        {},
    )

    if not isinstance(
        published,
        dict,
    ):

        raise TypeError(
            "Formatter Runtime "
            "'published' must be dict."
        )

    #
    # Required Reality fields for
    # downstream Identity / URL contract.
    #

    if not published.get(
        "product_code"
    ):

        raise ValueError(
            "Formatter Runtime has empty "
            "product_code."
        )

    if not published.get(
        "product_name"
    ):

        raise ValueError(
            "Formatter Runtime has empty "
            "product_name."
        )

    if not published.get(
        "url"
    ):

        raise ValueError(
            "Formatter Runtime has empty "
            "url."
        )


# ==============================================================================
# Product Formatter
# ==============================================================================

def format_product(
    document: AcquisitionDocument,
) -> dict:
    """
    Format one Lenovo AcquisitionDocument.
    """

    runtime = build_runtime(
        document
    )

    validate_runtime(
        runtime
    )

    return runtime


# ==============================================================================
# Formatter Runtime
# ==============================================================================

def formatter() -> list[dict]:
    """
    Execute Lenovo OpenAPI Formatter Runtime.

    Flow

        AcquisitionDocument
                ↓
        OpenAPI Reality
                ↓
        Published Runtime
                ↓
        Formatter Runtime

    Formatter does not access:

        Mapper
        Writer
        ImportDocument
        PCProduct
    """

    trace_pipeline(
        "FORMATTER",
    )

    print()

    print("=" * 70)

    print(
        f"{SITE_NAME.upper()} OPENAPI FORMATTER"
    )

    print("=" * 70)

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_name=SOURCE_NAME,

            document_type=DOCUMENT_TYPE,

        )

        .order_by(

            "document_key",

        )

    )

    runtimes: list[dict] = []

    failed = 0

    for document in documents:

        try:

            runtime = format_product(
                document
            )

        except Exception as exc:

            failed += 1

            print(
                "FAILED : "
                f"{document.document_key}"
            )

            print(
                f"  ERROR : {exc}"
            )

            continue

        runtimes.append(
            runtime
        )

    # ------------------------------------------------------------------
    # Runtime Summary
    # ------------------------------------------------------------------

    classification_entries = 0

    media_entries = 0

    priced_products = 0

    image_products = 0

    specification_entries = 0

    for runtime in runtimes:

        published = runtime.get(
            "published",
            {},
        )

        #
        # Existing runtime summary name is
        # preserved for compatibility.
        #
        # NOTE:
        # This currently counts category_path
        # entries, not classification entries.
        #

        classification_entries += len(

            normalize_list(

                published.get(
                    "category_path",
                    [],
                )

            )

        )

        specification_entries += len(

            normalize_list(

                published.get(
                    "specifications",
                    [],
                )

            )

        )

        media = normalize_dict(

            published.get(
                "media",
                {},
            )

        )

        media_entries += len(

            normalize_list(

                media.get(
                    "gallery",
                    [],
                )

            )

        )

        #
        # Price Reality check.
        #
        # Do not calculate or interpret price.
        # Only verify that published Reality exists.
        #

        if (

            published.get(
                "web_price"
            ) is not None

            or

            published.get(
                "final_price"
            ) is not None

        ):

            priced_products += 1

        if published.get(
            "image_url"
        ):

            image_products += 1

    print()

    print("=" * 70)

    print("FORMATTER RESULT")

    print("=" * 70)

    print(
        f"Documents              : "
        f"{documents.count()}"
    )

    print(
        f"Runtime Contracts      : "
        f"{len(runtimes)}"
    )

    print(
        f"Classification Entries : "
        f"{classification_entries}"
    )

    print(
        f"Specification Entries  : "
        f"{specification_entries}"
    )

    print(
        f"Media Entries          : "
        f"{media_entries}"
    )

    print(
        f"Priced Products        : "
        f"{priced_products}"
    )

    print(
        f"Image Products         : "
        f"{image_products}"
    )

    print(
        f"Failed                 : "
        f"{failed}"
    )

    print("=" * 70)

    return runtimes


# ==============================================================================
# Entry Point
# ==============================================================================

def main() -> list[dict]:
    """
    Runtime Entry Point.
    """

    return formatter()


# ==============================================================================
# Standalone Execution
# ==============================================================================

if __name__ == "__main__":

    main()