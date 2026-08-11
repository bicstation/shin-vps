#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/hp/formatter.py

SHIN CORE LINX

HP HawkSearch Formatter Runtime

AcquisitionDocument
        │
        ▼
Observed HP Reality
        │
        ▼
Product Reality
        │
        ▼
Structural Formatter
        │
        ▼
Runtime Contract

==============================================================================
CORE PRINCIPLE

Reality First
Observation First
Translation Authority

Formatter is a translation layer.

Formatter MAY:
- normalize containers
- resolve URLs
- normalize published numeric prices
- expose published fields under stable Runtime names
- preserve the complete original Reality
- attach SHIN internal Reality identity

Formatter MUST NOT:
- invent specifications
- combine different API unique_id records
- infer CPU/GPU meaning
- infer product type
- infer missing prices
- create fake tax/before-tax prices
- classify products
- generate affiliate meaning
- construct PCProduct
- perform AI analysis
- perform semantic processing

IMPORTANT

The HP HawkSearch API already provides a complete specification
combination under one API unique_id.

Therefore:

    1 AcquisitionDocument
            ↓
    1 Product Reality
            ↓
    1 Runtime Contract

No grouping.
No merging.
No cross-product combination.

==============================================================================
IDENTITY

HP API:

    unique_id
        ↓
    API-defined Reality identity

SHIN:

    internal_reality_id
        ↓
    unique_id_1
    unique_id_2
    unique_id_3
    ...

Formatter preserves BOTH.

Example:

    internal_reality_id = unique_id_1
    source_unique_id     = 8373-50668

==============================================================================
AFFILIATE

HP API:

    purchase_link
        ↓
    Formatter
        ↓
    purchase_url
        ↓
    Mapper
        ↓
    affiliate
        ↓
    PCProduct

Formatter does not invent affiliate meaning.

It only preserves the published purchase URL.

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
)


# ==============================================================================
# Runtime Constants
# ==============================================================================

DOCUMENT_TYPE = "product"

BASE_URL = (
    "https://jp.ext.hp.com"
)


# ==============================================================================
# Generic Normalization
# ==============================================================================

def normalize_text(
    value: Any,
) -> str:
    """
    Normalize presentation whitespace only.

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
) -> list[Any]:
    """
    Normalize scalar/tuple/list to list.

    Does not alter element meaning.
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
) -> dict[str, Any]:
    """
    Normalize a value to dict.

    No semantic transformation.
    """

    if isinstance(
        value,
        dict,
    ):
        return value

    return {}


# ==============================================================================
# Reality Access
# ==============================================================================

def first_value(
    reality: dict[str, Any],
    key: str,
) -> Any:
    """
    Return the first published value from a scalar/list field.

    Structural extraction only.
    """

    values = normalize_list(
        reality.get(
            key
        )
    )

    if not values:
        return ""

    return values[0]


def first_text(
    reality: dict[str, Any],
    key: str,
) -> str:
    """
    Return the first published value as normalized text.
    """

    return normalize_text(
        first_value(
            reality,
            key,
        )
    )


def preserve_values(
    reality: dict[str, Any],
    key: str,
) -> list[Any]:
    """
    Return the complete published field.

    Used where retaining all API values matters.
    """

    return normalize_list(
        reality.get(
            key
        )
    )


# ==============================================================================
# URL
# ==============================================================================

def normalize_url(
    value: Any,
    *,
    base_url: str = BASE_URL,
) -> str:
    """
    Structural URL normalization.

    No URL invention.
    """

    value = normalize_text(
        value
    )

    if not value:
        return ""

    if value.startswith(
        "//"
    ):
        return (
            "https:"
            + value
        )

    if value.startswith(
        (
            "http://",
            "https://",
        )
    ):
        return value

    return urljoin(
        base_url.rstrip("/")
        + "/",
        value.lstrip("/"),
    )


def resolve_product_url(
    reality: dict[str, Any],
) -> str:
    """
    Use the published HP product URL.

    Priority:

        full_link
        url_key
    """

    return normalize_url(
        first_value(
            reality,
            "full_link",
        )
        or first_value(
            reality,
            "url_key",
        )
    )


def extract_image_urls(
    reality: dict[str, Any],
) -> list[str]:
    """
    Preserve all published image URLs.
    """

    images: list[str] = []

    for raw in preserve_values(
        reality,
        "image_full_link",
    ):

        url = normalize_url(
            raw
        )

        if url:
            images.append(
                url
            )

    return images


# ==============================================================================
# Affiliate / Purchase URL
# ==============================================================================

def extract_purchase_url(
    reality: dict[str, Any],
) -> str:
    """
    Extract the actual URL from HP purchase_link.

    HP may publish:

        [
            "購入に進む",
            "https://..."
        ]

    Text such as '購入に進む' is not treated as a URL.

    The published purchase URL is preserved.

    Formatter does not create affiliate meaning.
    """

    for raw in preserve_values(
        reality,
        "purchase_link",
    ):

        if not isinstance(
            raw,
            str,
        ):
            continue

        value = raw.strip()

        if value.startswith(
            (
                "http://",
                "https://",
                "//",
            )
        ):
            return normalize_url(
                value
            )

    return ""


# ==============================================================================
# Commerce
# ==============================================================================

def published_price(
    reality: dict[str, Any],
    key: str,
) -> int | None:
    """
    Convert a published numeric price to int.

    Missing/invalid price remains None.

    Formatter never manufactures zero.

    0 would be a real numeric value and could falsely imply
    that HP published a zero price.
    """

    raw = first_value(
        reality,
        key,
    )

    if raw in (
        None,
        "",
    ):
        return None

    if isinstance(
        raw,
        str,
    ):
        raw = (
            raw.strip()
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
                raw
            )
        )

    except (
        TypeError,
        ValueError,
    ):

        return None


# ==============================================================================
# Published Specification Reality
# ==============================================================================

def build_specifications(
    reality: dict[str, Any],
) -> dict[str, Any]:
    """
    Structural mapping of HP published fields.

    This function only translates source field names into stable
    Runtime field names.

    No interpretation.

    Examples:

        hp_facet_os
            ↓
        os

        hp_facet_processortype
            ↓
        processor_type

    It does NOT determine what those values mean.
    """

    return {

        "os":
            first_text(
                reality,
                "hp_facet_os",
            ),

        "processor_type":
            first_text(
                reality,
                "hp_facet_processortype",
            ),

        "graphics":
            first_text(
                reality,
                "hp_facet_graphics",
            ),

        "memory":
            first_text(
                reality,
                "hp_facet_memstd",
            ),

        "storage":
            first_text(
                reality,
                "hp_filter_storagetype",
            ),

        "display_size":
            first_text(
                reality,
                "hp_facet_displaysize",
            ),

        "weight":
            first_text(
                reality,
                "hp_facet_weightmet",
            ),

        "display_input_type":
            first_text(
                reality,
                "hp_facet_displayinputtype",
            ),

        "usage":
            first_text(
                reality,
                "hp_facet_usage",
            ),

        "npu_aipc":
            preserve_values(
                reality,
                "hp_facet_npu_aipc",
            ),
    }


# ==============================================================================
# AcquisitionDocument
# ==============================================================================

def load_observation(
    document: AcquisitionDocument,
) -> dict[str, Any]:
    """
    Load the complete stored Observation.
    """

    if not document.content:

        raise ValueError(
            "Empty AcquisitionDocument: "
            f"{document.document_key}"
        )

    try:

        observation = json.loads(
            document.content
        )

    except json.JSONDecodeError as exc:

        raise ValueError(
            "Invalid HP Observation JSON: "
            f"{document.document_key}"
        ) from exc

    if not isinstance(
        observation,
        dict,
    ):

        raise ValueError(
            "HP Observation must be "
            "a dictionary: "
            f"{document.document_key}"
        )

    return observation


def extract_product_reality(
    observation: dict[str, Any],
) -> dict[str, Any]:
    """
    Extract exactly one Product Reality from one HP Observation.

    No fallback to unrelated Documents.
    No cross-document combination.
    """

    reality = observation.get(
        "reality"
    )

    if not isinstance(
        reality,
        dict,
    ):

        raise ValueError(
            "HP Observation has no "
            "Product Reality."
        )

    if not (
        reality.get(
            "unique_id"
        )
        or reality.get(
            "sku"
        )
        or reality.get(
            "name"
        )
    ):

        raise ValueError(
            "HP Product Reality has "
            "no identity."
        )

    return reality


# ==============================================================================
# Runtime Contract
# ==============================================================================

def build_runtime(
    document: AcquisitionDocument,
    observation: dict[str, Any],
    reality: dict[str, Any],
) -> dict[str, Any]:
    """
    Translate one HP Product Reality into one Runtime Contract.

    One input Reality
        ↓
    One Runtime Contract

    No grouping.
    No merging.
    No cross-product combination.
    """

    # --------------------------------------------------------------------------
    # Identity
    # --------------------------------------------------------------------------

    source_unique_id = (
        observation.get(
            "source_unique_id"
        )
        or first_text(
            reality,
            "unique_id",
        )
    )

    internal_reality_id = (
        observation.get(
            "internal_reality_id"
        )
        or document.document_key
    )

    # --------------------------------------------------------------------------
    # Media
    # --------------------------------------------------------------------------

    image_urls = extract_image_urls(
        reality
    )

    # --------------------------------------------------------------------------
    # Product URL
    # --------------------------------------------------------------------------

    product_url = resolve_product_url(
        reality
    )

    # --------------------------------------------------------------------------
    # Affiliate / Purchase URL
    # --------------------------------------------------------------------------

    purchase_url = extract_purchase_url(
        reality
    )

    # --------------------------------------------------------------------------
    # Published Specifications
    # --------------------------------------------------------------------------

    specifications = build_specifications(
        reality
    )

    # --------------------------------------------------------------------------
    # Commerce
    # --------------------------------------------------------------------------

    web_price = published_price(
        reality,
        "price_sale_sid1",
    )

    suggested_retail_price = published_price(
        reality,
        "suggested_retail_price",
    )

    # --------------------------------------------------------------------------
    # Published Features
    # --------------------------------------------------------------------------

    top_features = preserve_values(
        reality,
        "hp_topfeatureslist",
    )

    # ==========================================================================
    # Published Runtime
    # ==========================================================================

    published = {

        # ----------------------------------------------------------------------
        # Identity
        # ----------------------------------------------------------------------

        "internal_reality_id":
            internal_reality_id,

        "source_unique_id":
            source_unique_id,

        "sku":
            first_text(
                reality,
                "sku",
            ),

        "product_name":
            first_text(
                reality,
                "name",
            ),

        "product_type":
            first_text(
                reality,
                "product_type",
            ),

        "description":
            first_text(
                reality,
                "short_description",
            ),

        "category_name":
            first_text(
                reality,
                "category_name",
            ),

        "type":
            first_text(
                reality,
                "type",
            ),

        # ----------------------------------------------------------------------
        # Product URL
        # ----------------------------------------------------------------------

        "url":
            product_url,

        "source_url":
            normalize_url(
                document.source_url
            ),

        # ----------------------------------------------------------------------
        # Affiliate / Purchase URL
        # ----------------------------------------------------------------------

        "purchase_url":
            purchase_url,

        # ----------------------------------------------------------------------
        # Commerce
        # ----------------------------------------------------------------------

        "web_price":
            web_price,

        "final_price":
            web_price,

        "suggested_retail_price":
            suggested_retail_price,

        "price_range":
            first_text(
                reality,
                "price_range",
            ),

        # ----------------------------------------------------------------------
        # Media
        # ----------------------------------------------------------------------

        "image_url":
            (
                image_urls[0]
                if image_urls
                else ""
            ),

        "image_urls":
            image_urls,

        # ----------------------------------------------------------------------
        # Description / Features
        # ----------------------------------------------------------------------

        "short_description":
            first_text(
                reality,
                "short_description",
            ),

        "top_features":
            top_features,

        # ----------------------------------------------------------------------
        # Specifications
        # ----------------------------------------------------------------------

        "specifications":
            specifications,

        "operating_system":
            specifications[
                "os"
            ],

        "processor_type":
            specifications[
                "processor_type"
            ],

        "graphics":
            specifications[
                "graphics"
            ],

        "memory":
            specifications[
                "memory"
            ],

        "storage":
            specifications[
                "storage"
            ],

        "display_size":
            specifications[
                "display_size"
            ],

        "weight":
            specifications[
                "weight"
            ],

        "display_input_type":
            specifications[
                "display_input_type"
            ],

        "usage":
            specifications[
                "usage"
            ],

        # ----------------------------------------------------------------------
        # Complete Original HP Reality
        # ----------------------------------------------------------------------
        #
        # This is the most important preservation boundary.
        #
        # The original API Reality remains available after formatting.
        #

        "raw":
            reality,
    }

    # ==========================================================================
    # Runtime Contract
    # ==========================================================================

    return {

        "source_name":
            SOURCE_NAME,

        "site_name":
            SITE_NAME,

        "document_type":
            document.document_type,

        "document_key":
            document.document_key,

        "internal_reality_id":
            internal_reality_id,

        "source_unique_id":
            source_unique_id,

        "source_url":
            normalize_url(
                document.source_url
            ),

        "published":
            published,

        # Preserve the complete Observation envelope.
        "observation":
            observation,
    }


# ==============================================================================
# Validation
# ==============================================================================

def validate_runtime(
    runtime: dict[str, Any],
) -> None:
    """
    Structural validation only.

    Required:
        identity
        published
        observation

    Not required:
        CPU
        GPU
        price
        image
        purchase URL

    Those values may legitimately be absent from an HP Reality.
    """

    required = (

        "source_name",

        "site_name",

        "document_type",

        "document_key",

        "internal_reality_id",

        "source_unique_id",

        "published",

        "observation",

    )

    missing = [

        field

        for field in required

        if field not in runtime

    ]

    if missing:

        raise ValueError(
            "Formatter Runtime "
            "missing fields: "
            + ", ".join(
                missing
            )
        )

    published = runtime.get(
        "published"
    )

    if not isinstance(
        published,
        dict,
    ):

        raise TypeError(
            "Formatter Runtime "
            "'published' must be dict."
        )

    if not published.get(
        "source_unique_id"
    ):

        raise ValueError(
            "Formatter Runtime has "
            "empty source_unique_id."
        )

    if not published.get(
        "product_name"
    ):

        raise ValueError(
            "Formatter Runtime has "
            "empty product_name."
        )

    raw = published.get(
        "raw"
    )

    if not isinstance(
        raw,
        dict,
    ):

        raise ValueError(
            "Formatter Runtime lost "
            "original HP Reality."
        )

    raw_unique_id = first_text(
        raw,
        "unique_id",
    )

    if (
        raw_unique_id
        and raw_unique_id
        != published.get(
            "source_unique_id"
        )
    ):

        raise ValueError(
            "Formatter Runtime "
            "identity mismatch: "
            f"{raw_unique_id} != "
            f"{published.get('source_unique_id')}"
        )


# ==============================================================================
# Single Document Formatter
# ==============================================================================

def format_document(
    document: AcquisitionDocument,
) -> dict[str, Any]:
    """
    Format exactly one AcquisitionDocument.

    HP Observation Runtime already represents one API unique_id
    per Product Reality.

    Therefore:

        1 AcquisitionDocument
                ↓
        1 Product Reality
                ↓
        1 Runtime Contract
    """

    observation = load_observation(
        document
    )

    reality = extract_product_reality(
        observation
    )

    runtime = build_runtime(
        document,
        observation,
        reality,
    )

    validate_runtime(
        runtime
    )

    return runtime


# ==============================================================================
# Compatibility
# ==============================================================================

def format_product(
    document: AcquisitionDocument,
) -> dict[str, Any]:
    """
    Backward-compatible alias.
    """

    return format_document(
        document
    )


# ==============================================================================
# Formatter Runtime
# ==============================================================================

def formatter() -> list[
    dict[str, Any]
]:
    """
    Execute HP Formatter Runtime.

    Reads the HP Product Reality Documents created by Observation.

    IMPORTANT

    The Observation layer has already established the Reality boundary.

    Formatter does NOT:

    - search HawkSearch again
    - page through HawkSearch
    - regroup Results
    - combine API unique_ids
    - combine specifications
    - create additional products
    - collapse different API identities

    Therefore:

        481 Reality
            ↓
        481 Runtime Contracts

    assuming all 481 stored Reality Documents are valid.
    """

    trace_pipeline(
        "FORMATTER"
    )

    print()

    print(
        "=" * 70
    )

    print(
        f"{SITE_NAME.upper()} "
        "HAWKSEARCH FORMATTER"
    )

    print(
        "=" * 70
    )

    # ==========================================================================
    # Observation Documents
    # ==========================================================================

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_name=SOURCE_NAME,
            document_type=DOCUMENT_TYPE,
            document_key__startswith=(
                "unique_id_"
            ),
        )
        .order_by(
            "id"
        )
    )

    document_count = (
        documents.count()
    )

    runtimes: list[
        dict[str, Any]
    ] = []

    failed = 0

    # ==========================================================================
    # One Document -> One Runtime
    # ==========================================================================

    for document in documents:

        try:

            runtime = format_document(
                document
            )

        except Exception as exc:

            failed += 1

            print(
                f"FAILED : "
                f"{document.document_key}"
            )

            print(
                f"  ERROR : "
                f"{exc}"
            )

            continue

        runtimes.append(
            runtime
        )

    # ==========================================================================
    # Summary
    # ==========================================================================

    specification_entries = 0

    feature_entries = 0

    image_entries = 0

    priced_products = 0

    image_products = 0

    purchase_products = 0

    # --------------------------------------------------------------------------
    # Identity Check
    # --------------------------------------------------------------------------

    internal_ids: list[str] = []

    source_ids: list[str] = []

    # --------------------------------------------------------------------------
    # Runtime Inspection
    # --------------------------------------------------------------------------

    for runtime in runtimes:

        published = normalize_dict(
            runtime.get(
                "published"
            )
        )

        # ----------------------------------------------------------------------
        # Identity
        # ----------------------------------------------------------------------

        internal_id = normalize_text(
            runtime.get(
                "internal_reality_id"
            )
        )

        source_id = normalize_text(
            runtime.get(
                "source_unique_id"
            )
        )

        if internal_id:
            internal_ids.append(
                internal_id
            )

        if source_id:
            source_ids.append(
                source_id
            )

        # ----------------------------------------------------------------------
        # Specifications
        # ----------------------------------------------------------------------

        specifications = normalize_dict(
            published.get(
                "specifications"
            )
        )

        specification_entries += sum(
            1
            for value
            in specifications.values()
            if value
        )

        # ----------------------------------------------------------------------
        # Features
        # ----------------------------------------------------------------------

        feature_entries += len(
            normalize_list(
                published.get(
                    "top_features"
                )
            )
        )

        # ----------------------------------------------------------------------
        # Images
        # ----------------------------------------------------------------------

        images = normalize_list(
            published.get(
                "image_urls"
            )
        )

        image_entries += len(
            images
        )

        # ----------------------------------------------------------------------
        # Price
        # ----------------------------------------------------------------------

        if (
            published.get(
                "web_price"
            )
            is not None
        ):

            priced_products += 1

        # ----------------------------------------------------------------------
        # Image
        # ----------------------------------------------------------------------

        if published.get(
            "image_url"
        ):

            image_products += 1

        # ----------------------------------------------------------------------
        # Purchase / Affiliate
        # ----------------------------------------------------------------------

        if published.get(
            "purchase_url"
        ):

            purchase_products += 1

    # ==========================================================================
    # Duplicate Identity Check
    # ==========================================================================

    distinct_internal_ids = len(
        set(
            internal_ids
        )
    )

    distinct_source_ids = len(
        set(
            source_ids
        )
    )

    duplicate_internal_ids = (
        len(
            internal_ids
        )
        - distinct_internal_ids
    )

    duplicate_source_ids = (
        len(
            source_ids
        )
        - distinct_source_ids
    )

    # ==========================================================================
    # Result
    # ==========================================================================

    print()

    print(
        "=" * 70
    )

    print(
        "FORMATTER RESULT"
    )

    print(
        "=" * 70
    )

    print(
        f"Observation Documents : "
        f"{document_count}"
    )

    print(
        f"Runtime Contracts     : "
        f"{len(runtimes)}"
    )

    print(
        f"Internal Reality IDs  : "
        f"{distinct_internal_ids}"
    )

    print(
        f"Source Unique IDs     : "
        f"{distinct_source_ids}"
    )

    print(
        f"Duplicate Internal ID : "
        f"{duplicate_internal_ids}"
    )

    print(
        f"Duplicate Source ID   : "
        f"{duplicate_source_ids}"
    )

    print(
        f"Specification Entries : "
        f"{specification_entries}"
    )

    print(
        f"Feature Entries       : "
        f"{feature_entries}"
    )

    print(
        f"Image Entries         : "
        f"{image_entries}"
    )

    print(
        f"Priced Products       : "
        f"{priced_products}"
    )

    print(
        f"Image Products        : "
        f"{image_products}"
    )

    print(
        f"Purchase Products     : "
        f"{purchase_products}"
    )

    print(
        f"Failed                : "
        f"{failed}"
    )

    print(
        "=" * 70
    )

    return runtimes


# ==============================================================================
# Entry Point
# ==============================================================================

def main() -> list[
    dict[str, Any]
]:

    return formatter()


# ==============================================================================
# Standalone Execution
# ==============================================================================

if __name__ == "__main__":

    main()