#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/dell/mapper.py

SHIN CORE LINX

DELL Import Contract Mapper

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


NOT Responsibilities

- HTML Parsing
- HTTP Acquisition
- Reality Observation
- Formatter
- Product Import
- Database Processing
- Semantic Processing


IMPORTANT

DELL Observation Runtime has already produced
structured Published Reality.

Example:

    [
        {
            "label": "CPU",
            "value": "Intel Core Ultra 5 225"
        },
        {
            "label": "グラフィック",
            "value": "内蔵グラフィック"
        },
        {
            "label": "メモリ",
            "value": "DDR5-5600 16GB"
        }
    ]

Mapper translates the published labels into
Canonical Runtime fields.

Mapper does NOT infer semantic meaning.

==============================================================================
"""

from __future__ import annotations


from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)


from .settings import (
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

    DELL exposes specifications as structured
    label/value pairs.

    Example:

        {
            "label": "CPU",
            "value": "AMD Ryzen 5 8600G"
        }

    The Mapper performs source-specific translation:

        Published Label
                ↓
        Canonical Runtime Field

    This is Translation Authority.

    It is NOT semantic classification.

    No inference is performed.
    """

    observation = {

        "os": "",

        "cpu": "",

        "cooler": "",

        "case": "",

        "chipset": "",

        "memory": "",

        "storage": "",

        "gpu": "",

        "power": "",

        "wifi": "",

        "guarantee": "",
    }

    raw_specs = runtime.get(
        "raw_specs",
        [],
    )

    # --------------------------------------------------------------------------
    # Runtime Safety
    # --------------------------------------------------------------------------

    if not isinstance(
        raw_specs,
        list,
    ):
        return observation

    # --------------------------------------------------------------------------
    # Published Specification Translation
    # --------------------------------------------------------------------------

    for spec in raw_specs:

        if not isinstance(
            spec,
            dict,
        ):
            continue

        label = str(
            spec.get(
                "label",
                "",
            )
        ).strip()

        value = str(
            spec.get(
                "value",
                "",
            )
        ).strip()

        if not label or not value:
            continue

        # ----------------------------------------------------------------------
        # OS
        # ----------------------------------------------------------------------

        if label == "OS":

            observation["os"] = value

        # ----------------------------------------------------------------------
        # CPU
        # ----------------------------------------------------------------------

        elif label == "CPU":

            observation["cpu"] = value

        # ----------------------------------------------------------------------
        # Graphics
        # ----------------------------------------------------------------------

        elif label == "グラフィック":

            observation["gpu"] = value

        # ----------------------------------------------------------------------
        # Memory
        # ----------------------------------------------------------------------

        elif label == "メモリ":

            observation["memory"] = value

        # ----------------------------------------------------------------------
        # Storage
        # ----------------------------------------------------------------------

        elif label == "ストレージ":

            observation["storage"] = value

        # ----------------------------------------------------------------------
        # Motherboard / Chipset
        # ----------------------------------------------------------------------

        elif label == "マザーボード":

            observation["chipset"] = value

        # ----------------------------------------------------------------------
        # CPU Cooler
        # ----------------------------------------------------------------------

        elif label == "CPUクーラー":

            observation["cooler"] = value

        # ----------------------------------------------------------------------
        # Case
        # ----------------------------------------------------------------------

        elif label == "ケース":

            observation["case"] = value

        # ----------------------------------------------------------------------
        # Power Supply
        # ----------------------------------------------------------------------

        elif label == "電源":

            observation["power"] = value

        # ----------------------------------------------------------------------
        # Wireless
        # ----------------------------------------------------------------------

        elif label in (
            "Wi-Fi",
            "Wifi",
            "無線LAN",
            "Bluetooth",
        ):

            observation["wifi"] = value

        # ----------------------------------------------------------------------
        # Guarantee
        # ----------------------------------------------------------------------

        elif label == "保証":

            observation["guarantee"] = value

        # ----------------------------------------------------------------------
        # Unknown Published Label
        # ----------------------------------------------------------------------

        else:

            # Unknown Reality is intentionally ignored here.
            #
            # We do NOT guess where it belongs.
            #
            # The original Reality remains available in
            # Formatter Runtime / AcquisitionDocument.
            #
            pass

    return observation


# ==============================================================================
# Identity Builder
# ==============================================================================

def build_identity(
    runtime: dict,
) -> dict:
    """
    Build Identity Contract.
    """

    product_name = runtime.get(
        "raw_title",
        "",
    )

    product_url = runtime.get(
        "raw_detail_url",
        "",
    )

    return {

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

        "product_no":

            product_name,

        "sku":

            product_name,

        "product_name":

            product_name,

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

    DELL publishes price information on
    the listing card.

    Stock information is not currently
    observed by the Card Observation Runtime,
    therefore an absent value remains empty.
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
# DELL URL Contract Builder
# ==============================================================================

def build_affiliate(
    runtime: dict,
) -> dict:
    """
    Build DELL URL Contract.

    DELL Runtime does NOT generate
    a new Affiliate URL.

    The URL reaching this stage is already
    the resolved DELL Manufacturer URL.

    Pipeline:

        PCProduct.affiliate_url
                ↓
        DELL URL Resolver
                ↓
        DELL Manufacturer URL
                ↓
        Observation
                ↓
        Formatter
                ↓
        Mapper
                ↓
        Preserve URL

    No Affiliate transformation is performed.

    The existing "affiliate" Contract key
    is preserved for downstream compatibility.
    """

    product_url = runtime.get(
        "raw_detail_url",
        "",
    )

    return {

        "original_url":

            product_url,

        "url":

            product_url,
    }


# ==============================================================================
# Observation Runtime Builder
# ==============================================================================

def build_observation_runtime(
    runtime: dict,
) -> dict:
    """
    Build Observation Runtime.

    This stage translates only published
    specification labels.

    No semantic processing occurs here.
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

    Description is preserved from the
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
        # DELL URL
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

def mapper(
    runtimes: list[dict],
) -> list[dict]:
    """
    Execute DELL Import Contract Mapper.

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

    print(
        f"INPUT RUNTIMES : {len(runtimes)}"
    )

    contracts: list[dict] = []

    for runtime in runtimes:

        contract = build_contract(
            runtime,
        )

        contracts.append(
            contract,
        )

        print(
            f"MAP : "
            f"{contract['identity']['product_name']}"
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

def main(
    runtimes: list[dict] | None = None,
):
    """
    Runtime Entry Point.

    Pipeline owns Formatter execution.

    Mapper receives Formatter Runtime output.
    """

    if runtimes is None:

        raise RuntimeError(
            "DELL Mapper requires "
            "Formatter Runtime output."
        )

    return mapper(
        runtimes,
    )


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()