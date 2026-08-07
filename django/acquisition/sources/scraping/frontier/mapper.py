#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/frontier/mapper.py

SHIN CORE LINX

FRONTIER Import Contract Mapper

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
- Reality Observation
- Formatter
- Product Import
- Database Processing
- Semantic Processing

==============================================================================
"""

from __future__ import annotations

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from imports.common.affiliate import (
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
    """

    return (

        value

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

    return (

        f"{SOURCE_PREFIX}_"

        f"{normalize_identifier(runtime['raw_title'])}"

    )

# ==============================================================================
# Specification Translator
# ==============================================================================

def translate_specifications(
    runtime: dict,
) -> dict:
    """
    Translate Published Specifications
    into Observation Runtime.
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

    for spec in runtime["raw_specs"]:

        if "Windows" in spec:

            observation["os"] = spec

        elif "Core" in spec or "Ryzen" in spec:

            observation["cpu"] = spec

        elif "CPUクーラー" in spec:

            observation["cooler"] = spec

        elif "ケース" in spec:

            observation["case"] = spec

        elif "チップセット" in spec:

            observation["chipset"] = spec

        elif "メモリ" in spec:

            observation["memory"] = spec

        elif "SSD" in spec:

            observation["storage"] = spec

        elif "GeForce" in spec or "Radeon" in spec:

            observation["gpu"] = spec

        elif "電源" in spec:

            observation["power"] = spec

        elif "Wi-Fi" in spec or "Bluetooth" in spec:

            observation["wifi"] = spec

        elif "保証" in spec:

            observation["guarantee"] = spec

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

            runtime["raw_title"],

        "sku":

            runtime["raw_title"],

        "product_name":

            runtime["raw_title"],

        "product_url":

            runtime["raw_detail_url"],

    }

# ==============================================================================
# Commerce Builder
# ==============================================================================

def build_commerce(
    runtime: dict,
) -> dict:
    """
    Build Commerce Contract.
    """

    return {

        "price":

            runtime["raw_price"],

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

            runtime["raw_image"],

    }


# ==============================================================================
# Affiliate Builder
# ==============================================================================

def build_affiliate(
    runtime: dict,
) -> dict:
    """
    Build Affiliate Contract.
    """

    product_url = runtime[

        "raw_detail_url"

    ]

    return {

        "original_url":

            product_url,

        "affiliate_url":

            generate_affiliate_url(

                product_url,

                AFFILIATE,

            ),

    }

# ==============================================================================
# Observation Runtime Builder
# ==============================================================================

def build_observation_runtime(
    runtime: dict,
) -> dict:
    """
    Build Observation Runtime.
    """

    return translate_specifications(

        runtime,

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

        #
        # Identity
        #

        "identity":

            build_identity(

                runtime,

            ),

        #
        # Commerce
        #

        "commerce":

            build_commerce(

                runtime,

            ),

        #
        # Media
        #

        "media":

            build_media(

                runtime,

            ),

        #
        # Affiliate
        #

        "affiliate":

            build_affiliate(

                runtime,

            ),

        #
        # Observation Runtime
        #

        "observation_runtime":

            build_observation_runtime(

                runtime,

            ),

    }


# ==============================================================================
# Mapper Runtime
# ==============================================================================

def mapper():
    """
    Execute Import Contract Mapper.
    """

    trace_pipeline(
        "MAPPER",
    )

    print("=" * 70)
    print(f"{SITE_NAME} IMPORT CONTRACT MAPPER")
    print("=" * 70)

    runtimes = formatter()

    contracts = []

    for runtime in runtimes:

        contract = build_contract(

            runtime,

        )

        contracts.append(

            contract,

        )

        print(

            contract["identity"]["product_name"]

        )

    print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"Contracts : {len(contracts)}")
    print("=" * 70)

    return contracts


# ==============================================================================
# Entry Point
# ==============================================================================

def main():
    """
    Runtime Entry Point.
    """

    return mapper()


if __name__ == "__main__":

    main()
