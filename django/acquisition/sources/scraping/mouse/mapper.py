#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/mouse/mapper.py

SHIN CORE LINX

mouse Import Contract Mapper

Reality First Pipeline

Runtime Contract
        │
        ▼
Import Contract
        │
        ▼
ImportDocument


Reality First
Observation First
Translation Authority
Semantic Later


Responsibilities

- Translate Runtime Contract
- Build Import Contract
- Build Identity Contract
- Build Commerce Contract
- Build Media Contract
- Build Affiliate Contract
- Build Observation Runtime
- Preserve Published Specification Reality


NOT Responsibilities

- HTML Parsing
- HTTP Acquisition
- Reality Observation
- Formatter
- Product Import
- Database Processing
- Semantic Processing
- Specification Inference


IMPORTANT

MOUSE Listing Observation Runtime produces Product Card Reality.

Example:

    {
        "product_name":
            "DAIV FW-P6N40",

        "product_no":
            "FWP6N40B6AFD1W01DEC",

        "product_url":
            "https://www.mouse-jp.co.jp/store/g/.../",

        "description":
            "...",

        "specifications":
            [
                "Windows 11 Pro 64ビット",
                "AMD Ryzen Threadripper ...",
                "NVIDIA RTX PRO ...",
                "64GB ...",
                "2TB ...",
                "Wi-Fi ...",
                "3年間 ..."
            ],

        "price":
            "2199800",

        "image_url":
            "https://..."
    }


IMPORTANT

MOUSE Listing specifications are published as plain strings.

Example:

    [
        "Windows 11 Home 64ビット",
        "AMD Ryzen™ 7 7700 プロセッサ",
        "NVIDIA® GeForce RTX™ 5070",
        "32GB (16GB×2 / デュアルチャネル)",
        "2TB (NVMe Gen4×4)",
        "Wi-Fi 6E ...",
        "3年間センドバック修理保証 ..."
    ]


The Listing Card does NOT provide explicit labels such as:

    CPU
    GPU
    メモリ
    ストレージ
    OS

Therefore Mapper MUST NOT infer:

    "AMD Ryzen..."
        → cpu

    "32GB..."
        → memory

    "2TB..."
        → storage

    "Windows..."
        → os


Those interpretations belong to a later semantic/specification runtime.

The original specification Reality is preserved under:

    observation_runtime["specifications"]

==============================================================================
"""

from __future__ import annotations


from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)


from acquisition.common.affiliate.affiliate import (
    generate_affiliate_url,
)


from .formatter_cards import (
    formatter,
)


from .settings import (
    AFFILIATE,
    SITE_NAME,
)


# ==============================================================================
# Runtime
# ==============================================================================

SOURCE_PREFIX = SITE_NAME.upper()


# ==============================================================================
# Runtime Utility
# ==============================================================================

def normalize_identifier(
    value: str,
) -> str:
    """
    Normalize Runtime Identifier.

    This is identifier normalization only.

    No semantic transformation is performed.
    """

    if not value:
        return ""

    return (
        str(value)
        .strip()
        .replace(
            " ",
            "_",
        )
        .replace(
            "/",
            "_",
        )
    )


# ==============================================================================
# Unique ID Builder
# ==============================================================================

def build_unique_id(
    runtime: dict,
) -> str:
    """
    Build Runtime Unique ID.

    Current MOUSE identity authority:

        source + product title

    Example:

        MOUSE_DAIV_FW-P6N40
    """

    title = runtime.get(
        "raw_title",
        "",
    )

    return (
        f"{SOURCE_PREFIX}_"
        f"{normalize_identifier(title)}"
    )


# ==============================================================================
# Specification Translator
# ==============================================================================

def translate_specifications(
    runtime: dict,
) -> dict:
    """
    Translate Published Specification Reality
    into Observation Runtime.

    IMPORTANT

    MOUSE Listing specifications are NOT exposed
    as label/value pairs.

    They are published as plain strings.

    Therefore this Mapper does NOT attempt to classify
    specification strings.

    Published Reality:

        [
            "Windows 11 Home 64ビット",
            "AMD Ryzen™ 7 7700 プロセッサ",
            "NVIDIA® GeForce RTX™ 5070",
            "32GB (16GB×2 / デュアルチャネル)",
            "2TB (NVMe Gen4×4)"
        ]

    is preserved as:

        {
            "os": "",
            "cpu": "",
            "gpu": "",
            ...
            "specifications": [
                ...
            ]
        }

    The canonical fields remain empty because
    no explicit source label exists in the Listing Card.

    No semantic inference is performed.
    """

    observation = {

        # ----------------------------------------------------------------------
        # Canonical Runtime Fields
        #
        # These remain empty because the MOUSE Listing Card does not publish
        # explicit specification labels.
        # ----------------------------------------------------------------------

        "os": "",

        "cpu": "",

        "gpu": "",

        "cooler": "",

        "case": "",

        "chipset": "",

        "memory": "",

        "storage": "",

        "power": "",

        "wifi": "",

        "guarantee": "",

        # ----------------------------------------------------------------------
        # Published Specification Reality
        #
        # Preserve exactly the strings observed from the Listing Card.
        # ----------------------------------------------------------------------

        "specifications": [],
    }

    raw_specs = runtime.get(
        "raw_specs",
        [],
    )

    # ==========================================================================
    # Runtime Safety
    # ==========================================================================

    if not isinstance(
        raw_specs,
        list,
    ):

        return observation

    # ==========================================================================
    # Published Specification Preservation
    # ==========================================================================

    for spec in raw_specs:

        if not isinstance(
            spec,
            str,
        ):

            continue

        value = spec.strip()

        if not value:

            continue

        observation["specifications"].append(
            value,
        )

    return observation


# ==============================================================================
# Identity Builder
# ==============================================================================

def build_identity(
    runtime: dict,
) -> dict:
    """
    Build Identity Contract.

    Product identity is taken directly from
    Formatter Runtime.

    product_no is preserved separately from
    product_name.
    """

    product_name = runtime.get(
        "raw_title",
        "",
    )

    product_no = runtime.get(
        "raw_product_no",
        "",
    )

    product_url = runtime.get(
        "raw_detail_url",
        "",
    )

    return {

        # ----------------------------------------------------------------------
        # Runtime Identity
        # ----------------------------------------------------------------------

        "unique_id":

            build_unique_id(
                runtime,
            ),

        "maker":

            SITE_NAME,

        "brand": "",

        "series": "",

        "collaboration": "",

        "model": "",

        # ----------------------------------------------------------------------
        # Product Number
        # ----------------------------------------------------------------------

        "product_no":

            product_no,

        "sku":

            product_no,

        # ----------------------------------------------------------------------
        # Product Name
        # ----------------------------------------------------------------------

        "product_name":

            product_name,

        # ----------------------------------------------------------------------
        # Reality URL
        # ----------------------------------------------------------------------

        "product_url":

            product_url,
    }


# ==============================================================================
# Commerce Builder
# ==============================================================================

def build_commerce(
    runtime: dict,
) -> dict:
    """
    Build Commerce Contract.

    MOUSE publishes price information on
    the Listing Card.

    Stock information is not currently
    observed by the Card Observation Runtime.

    Therefore absent stock remains empty.
    """

    return {

        "price":

            runtime.get(
                "raw_price",
                "",
            ),

        "stock":

            runtime.get(
                "raw_stock",
                "",
            ),
    }


# ==============================================================================
# Media Builder
# ==============================================================================

def build_media(
    runtime: dict,
) -> dict:
    """
    Build Media Contract.
    """

    return {

        "image_url":

            runtime.get(
                "raw_image",
                "",
            ),
    }


# ==============================================================================
# Affiliate Builder
# ==============================================================================

def build_affiliate(
    runtime: dict,
) -> dict:
    """
    Build Affiliate Contract.

    Reality URL
        ↓
    Common Affiliate Generator
        ↓
    Affiliate URL

    Provider-specific logic remains inside:

        acquisition.common.affiliate.affiliate
    """

    product_url = runtime.get(
        "raw_detail_url",
        "",
    )

    affiliate_url = generate_affiliate_url(
        product_url,
        AFFILIATE,
    )

    print(
        "=" * 70
    )

    print(
        "AFFILIATE BUILDER"
    )

    print(
        "=" * 70
    )

    print(
        "URL       :",
        product_url,
    )

    print(
        "CONFIG    :",
        AFFILIATE,
    )

    print(
        "GENERATED :",
        affiliate_url,
    )

    print(
        "=" * 70
    )

    return {

        "original_url":

            product_url,

        "url":

            affiliate_url,
    }


# ==============================================================================
# Observation Runtime Builder
# ==============================================================================

def build_observation_runtime(
    runtime: dict,
) -> dict:
    """
    Build Observation Runtime.

    Only source-published information is translated.

    MOUSE specification strings are preserved
    without semantic inference.
    """

    return translate_specifications(
        runtime,
    )


# ==============================================================================
# Description Builder
# ==============================================================================

def build_description(
    runtime: dict,
) -> str:
    """
    Build Published Description Contract.

    Description is preserved from
    Formatter Runtime.

    No semantic interpretation is performed.
    """

    return runtime.get(
        "raw_description",
        "",
    )


# ==============================================================================
# Import Contract Builder
# ==============================================================================

def build_contract(
    runtime: dict,
) -> dict:
    """
    Build Import Contract.
    """

    return {

        # ----------------------------------------------------------------------
        # Identity
        # ----------------------------------------------------------------------

        "identity":

            build_identity(
                runtime,
            ),

        # ----------------------------------------------------------------------
        # Description
        # ----------------------------------------------------------------------

        "description":

            build_description(
                runtime,
            ),

        # ----------------------------------------------------------------------
        # Commerce
        # ----------------------------------------------------------------------

        "commerce":

            build_commerce(
                runtime,
            ),

        # ----------------------------------------------------------------------
        # Media
        # ----------------------------------------------------------------------

        "media":

            build_media(
                runtime,
            ),

        # ----------------------------------------------------------------------
        # Affiliate
        # ----------------------------------------------------------------------

        "affiliate":

            build_affiliate(
                runtime,
            ),

        # ----------------------------------------------------------------------
        # Observation Runtime
        # ----------------------------------------------------------------------

        "observation_runtime":

            build_observation_runtime(
                runtime,
            ),
    }


# ==============================================================================
# Mapper Runtime
# ==============================================================================

def mapper() -> list[dict]:
    """
    Execute mouse Import Contract Mapper.

    Pipeline:

        Formatter Runtime
                ↓
        Runtime Contract
                ↓
        Mapper
                ↓
        Import Contract
    """

    trace_pipeline(
        "MAPPER",
    )

    print()

    print(
        "=" * 70
    )

    print(
        f"{SITE_NAME} IMPORT CONTRACT MAPPER"
    )

    print(
        "=" * 70
    )

    runtimes = formatter()

    contracts: list[dict] = []

    for runtime in runtimes:

        contract = build_contract(
            runtime,
        )

        contracts.append(
            contract,
        )

        identity = contract.get(
            "identity",
            {},
        )

        observation = contract.get(
            "observation_runtime",
            {},
        )

        specifications = observation.get(
            "specifications",
            [],
        )

        print(
            f"MAP : "
            f"{identity.get('product_name', '')}"
        )

        print(
            f"  NO   : "
            f"{identity.get('product_no', '')}"
        )

        print(
            f"  SPEC : "
            f"{len(specifications)} items"
        )

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
        f"Contracts : {len(contracts)}"
    )

    print(
        "=" * 70
    )

    return contracts


# ==============================================================================
# Entry Point
# ==============================================================================

def main():
    """
    Runtime Entry Point.
    """

    return mapper()


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()