# /home/maya/shin-dev/shin-vps/django/acquisition/sources/scraping/hp/normalize_hawksearch.py
#!/usr/bin/env python3

# ============================================================================
#
# FILE:
# acquisition/sources/scraping/hp/normalize_hawksearch.py
#
# SHIN CORE LINX
#
# HP HawkSearch Normalization Runtime
#
# Reality First
#
# Pipeline
#
# HawkSearch Raw Runtime
# │
# ▼
# Results[]
# │
# ▼
# Product Reality
#
# Responsibilities
#
# - Convert HawkSearch Response into Product Reality
# - Expand Results[]
# - Normalize HawkSearch Document fields
# - Preserve raw Reality
# - Preserve images
# - Preserve price
# - Preserve purchase URL
# - Preserve product URL
# - Preserve SKU / unique_id
#
# NOT
#
# - HTTP Fetch
# - Observation Persistence
# - Product Mapping
# - Product Definition
# - Semantic Processing
# - AI Interpretation
#
# ============================================================================

from __future__ import annotations

from typing import Any


# ============================================================================
# Runtime Constants
# ============================================================================

RUNTIME_NAME = "HP HawkSearch Normalize Runtime"


# ============================================================================
# Helpers
# ============================================================================

def _first(
    value: Any,
    default: Any = "",
) -> Any:
    """
    Return the first value when HawkSearch provides a list.

    HawkSearch Document fields are normally represented as:

        {
            "sku": ["50668"]
        }

    This helper converts that into:

        "50668"
    """

    if isinstance(value, list):

        if not value:
            return default

        return value[0]

    if value is None:
        return default

    return value


def _list(
    value: Any,
) -> list[Any]:
    """
    Normalize a HawkSearch field into a list.
    """

    if value is None:
        return []

    if isinstance(value, list):
        return value

    return [value]


def _clean_string(
    value: Any,
) -> str:
    """
    Normalize a value into a string.
    """

    value = _first(
        value,
        "",
    )

    if value is None:
        return ""

    return str(value).strip()


def _extract_document(
    result: dict[str, Any],
) -> dict[str, Any]:
    """
    Extract HawkSearch Document.

    Expected structure:

        Results[]
          └── Document
    """

    document = result.get(
        "Document",
        {},
    )

    if not isinstance(document, dict):
        return {}

    return document


# ============================================================================
# Product Reality
# ============================================================================

def normalize_result(
    *,
    result: dict[str, Any],
    seed: dict[str, Any],
    page_no: int,
    result_index: int,
) -> dict[str, Any]:
    """
    Convert one HawkSearch Result into one Product Reality.
    """

    document = _extract_document(
        result,
    )

    unique_id = _clean_string(
        document.get("unique_id"),
    )

    sku = _clean_string(
        document.get("sku"),
    )

    product_code = (
        unique_id
        or sku
    )

    product_url = _clean_string(
        document.get("url_key")
        or document.get("full_link"),
    )

    purchase_urls = _list(
        document.get("purchase_link"),
    )

    purchase_url = ""

    for value in purchase_urls:

        value = _clean_string(
            value,
        )

        if value.startswith(
            "http://"
        ) or value.startswith(
            "https://"
        ):

            purchase_url = value
            break

    image_urls = []

    for value in _list(
        document.get("image_full_link"),
    ):

        value = _clean_string(
            value,
        )

        if value:
            image_urls.append(
                value
            )

    price_sale = _clean_string(
        document.get(
            "price_sale_sid1",
        ),
    )

    suggested_retail_price = _clean_string(
        document.get(
            "suggested_retail_price",
        ),
    )

    name = _clean_string(
        document.get(
            "name",
        ),
    )

    category_name = _clean_string(
        document.get(
            "category_name",
        ),
    )

    short_description = _clean_string(
        document.get(
            "short_description",
        ),
    )

    top_features = _list(
        document.get(
            "hp_topfeatureslist",
        ),
    )

    reality = {

        # ------------------------------------------------------------------
        # Identity
        # ------------------------------------------------------------------

        "product_code": product_code,

        "unique_id": unique_id,

        "sku": sku,

        "name": name,

        # ------------------------------------------------------------------
        # Product
        # ------------------------------------------------------------------

        "category_name": category_name,

        "product_type": _clean_string(
            document.get(
                "product_type",
            ),
        ),

        "type": _clean_string(
            document.get(
                "type",
            ),
        ),

        # ------------------------------------------------------------------
        # URL
        # ------------------------------------------------------------------

        "url": product_url,

        "url_key": product_url,

        "full_link": product_url,

        "purchase_url": purchase_url,

        "purchase_links": purchase_urls,

        # ------------------------------------------------------------------
        # Price
        # ------------------------------------------------------------------

        "price": price_sale,

        "price_sale_sid1": price_sale,

        "price_range": _clean_string(
            document.get(
                "price_range",
            ),
        ),

        "suggested_retail_price": (
            suggested_retail_price
        ),

        # ------------------------------------------------------------------
        # Images
        # ------------------------------------------------------------------

        "image_url": (
            image_urls[0]
            if image_urls
            else ""
        ),

        "image_urls": image_urls,

        # ------------------------------------------------------------------
        # Description
        # ------------------------------------------------------------------

        "short_description": (
            short_description
        ),

        # ------------------------------------------------------------------
        # Specification Reality
        # ------------------------------------------------------------------

        "os": _clean_string(
            document.get(
                "hp_facet_os",
            ),
        ),

        "processor_type": _clean_string(
            document.get(
                "hp_facet_processortype",
            ),
        ),

        "memory": _clean_string(
            document.get(
                "hp_facet_memstd",
            ),
        ),

        "storage": _clean_string(
            document.get(
                "hp_filter_storagetype",
            ),
        ),

        "display_size": _clean_string(
            document.get(
                "hp_facet_displaysize",
            ),
        ),

        "weight": _clean_string(
            document.get(
                "hp_facet_weightmet",
            ),
        ),

        "graphics": _clean_string(
            document.get(
                "hp_facet_graphics",
            ),
        ),

        "display_input_type": _clean_string(
            document.get(
                "hp_facet_displayinputtype",
            ),
        ),

        "usage": _clean_string(
            document.get(
                "hp_facet_usage",
            ),
        ),

        "memory_standard": _clean_string(
            document.get(
                "hp_facet_memstd",
            ),
        ),

        "top_features": top_features,

        # ------------------------------------------------------------------
        # Reality Metadata
        # ------------------------------------------------------------------

        "created_date": _clean_string(
            document.get(
                "created_date",
            ),
        ),

        "tab_facet": _clean_string(
            document.get(
                "tab_facet",
            ),
        ),

        # ------------------------------------------------------------------
        # Source
        # ------------------------------------------------------------------

        "source_name": "hp",

        "source_type": "hawksearch",

        "source_url": seed.get(
            "url",
            "",
        ),

        "seed_entry_name": seed.get(
            "entry_name",
            "",
        ),

        "seed_maker": seed.get(
            "maker",
            "",
        ),

        "seed_series": seed.get(
            "series",
            "",
        ),

        "seed_slug": seed.get(
            "slug",
            "",
        ),

        "page_no": page_no,

        "result_index": result_index,

        # ------------------------------------------------------------------
        # Raw Reality
        # ------------------------------------------------------------------

        "hawksearch_result": result,

        "hawksearch_document": document,
    }

    return reality


# ============================================================================
# Runtime
# ============================================================================

def normalize_runtime(
    *,
    runtime: dict[str, Any],
) -> list[dict[str, Any]]:
    """
    Normalize one HawkSearch Runtime.

    Expected Runtime:

        {
            "seed": {...},
            "page_no": 1,
            "request": {...},
            "response": {
                "Results": [...]
            }
        }
    """

    seed = runtime.get(
        "seed",
        {},
    )

    if not isinstance(seed, dict):
        seed = {}

    page_no = runtime.get(
        "page_no",
        1,
    )

    response = runtime.get(
        "response",
        {},
    )

    if not isinstance(response, dict):
        return []

    results = response.get(
        "Results",
        [],
    )

    if not isinstance(results, list):
        return []

    realities = []

    for index, result in enumerate(
        results,
        start=1,
    ):

        if not isinstance(
            result,
            dict,
        ):
            continue

        reality = normalize_result(
            result=result,
            seed=seed,
            page_no=page_no,
            result_index=index,
        )

        realities.append(
            reality
        )

    return realities


# ============================================================================
# Batch Runtime
# ============================================================================

def normalize(
    *,
    runtimes: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Normalize all HawkSearch Runtimes.
    """

    realities = []

    for runtime in runtimes:

        realities.extend(
            normalize_runtime(
                runtime=runtime,
            )
        )

    return realities


# ============================================================================
# Runtime Statistics
# ============================================================================

def summarize(
    realities: list[dict[str, Any]],
) -> dict[str, int]:
    """
    Report Reality quality.
    """

    total = len(
        realities
    )

    unique_ids = {
        reality.get(
            "unique_id"
        )
        for reality in realities
        if reality.get(
            "unique_id"
        )
    }

    product_codes = {
        reality.get(
            "product_code"
        )
        for reality in realities
        if reality.get(
            "product_code"
        )
    }

    duplicate_count = (
        total
        - len(unique_ids)
    )

    missing_product_code = sum(
        1
        for reality in realities
        if not reality.get(
            "product_code"
        )
    )

    priced = sum(
        1
        for reality in realities
        if reality.get(
            "price"
        )
    )

    with_images = sum(
        1
        for reality in realities
        if reality.get(
            "image_urls"
        )
    )

    with_purchase = sum(
        1
        for reality in realities
        if reality.get(
            "purchase_url"
        )
    )

    return {

        "total": total,

        "unique_ids": len(
            unique_ids
        ),

        "product_codes": len(
            product_codes
        ),

        "duplicates": duplicate_count,

        "missing_product_code": (
            missing_product_code
        ),

        "priced": priced,

        "with_images": with_images,

        "with_purchase": with_purchase,
    }


# ============================================================================
# Public API
# ============================================================================

def main(
    *,
    runtimes: list[dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    """
    Normalize HawkSearch Runtime.

    This Runtime does NOT persist anything.
    """

    if runtimes is None:
        runtimes = []

    realities = normalize(
        runtimes=runtimes,
    )

    stats = summarize(
        realities,
    )

    print()
    print("=" * 70)
    print("HP HAWKSEARCH NORMALIZATION")
    print("=" * 70)

    print(
        f"Raw Product Results   : "
        f"{stats['total']}"
    )

    print(
        f"Unique IDs             : "
        f"{stats['unique_ids']}"
    )

    print(
        f"Product Codes          : "
        f"{stats['product_codes']}"
    )

    print(
        f"Duplicates             : "
        f"{stats['duplicates']}"
    )

    print(
        f"Missing Product Code   : "
        f"{stats['missing_product_code']}"
    )

    print(
        f"Priced Products        : "
        f"{stats['priced']}"
    )

    print(
        f"Image Products         : "
        f"{stats['with_images']}"
    )

    print(
        f"Purchase Products      : "
        f"{stats['with_purchase']}"
    )

    print("=" * 70)

    return realities


# ============================================================================
# Standalone
# ============================================================================

if __name__ == "__main__":

    main()