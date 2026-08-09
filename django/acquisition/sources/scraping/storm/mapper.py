#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/storm/mapper.py

SHIN CORE LINX

STORM Import Contract Mapper

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
    """

    if not value:
        return ""

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
    Translate Published Specification Reality
    into Observation Runtime.

    STORM listing cards expose specification information
    as a single published text string.

    Therefore this Runtime performs controlled
    source-specific classification.

    No semantic inference is performed.
    """

    raw_specs = runtime.get(
        "raw_specs",
        "",
    )

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

    if not raw_specs:
        return observation

    # --------------------------------------------------------------------------
    # STORM card specification is currently a single string.
    #
    # Do NOT:
    #
    #     for spec in raw_specs
    #
    # because that iterates characters.
    #
    # --------------------------------------------------------------------------

    spec = str(
        raw_specs,
    ).strip()

    if not spec:
        return observation

    # --------------------------------------------------------------------------
    # OS
    # --------------------------------------------------------------------------

    if "Windows" in spec:

        observation["os"] = spec

    # --------------------------------------------------------------------------
    # CPU
    # --------------------------------------------------------------------------

    if (
        "Core" in spec
        or "Ryzen" in spec
    ):

        observation["cpu"] = spec

    # --------------------------------------------------------------------------
    # Cooler
    # --------------------------------------------------------------------------

    if "CPUクーラー" in spec:

        observation["cooler"] = spec

    # --------------------------------------------------------------------------
    # Case
    # --------------------------------------------------------------------------

    if "ケース" in spec:

        observation["case"] = spec

    # --------------------------------------------------------------------------
    # Chipset
    # --------------------------------------------------------------------------

    if "チップセット" in spec:

        observation["chipset"] = spec

    # --------------------------------------------------------------------------
    # Memory
    # --------------------------------------------------------------------------

    if (
        "メモリ" in spec
        or "DDR" in spec
    ):

        observation["memory"] = spec

    # --------------------------------------------------------------------------
    # Storage
    # --------------------------------------------------------------------------

    if (
        "SSD" in spec
        or "NVMe" in spec
    ):

        observation["storage"] = spec

    # --------------------------------------------------------------------------
    # GPU
    # --------------------------------------------------------------------------

    if (
        "GeForce" in spec
        or "RTX" in spec
        or "Radeon" in spec
        or "RX " in spec
    ):

        observation["gpu"] = spec

    # --------------------------------------------------------------------------
    # Power
    # --------------------------------------------------------------------------

    if "電源" in spec:

        observation["power"] = spec

    # --------------------------------------------------------------------------
    # Wireless
    # --------------------------------------------------------------------------

    if (
        "Wi-Fi" in spec
        or "Wifi" in spec
        or "無線LAN" in spec
        or "Bluetooth" in spec
    ):

        observation["wifi"] = spec

    # --------------------------------------------------------------------------
    # Guarantee
    # --------------------------------------------------------------------------

    if "保証" in spec:

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

        # ----------------------------------------------------------------------
        # Identity
        # ----------------------------------------------------------------------

        "identity":

            build_identity(
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
    Execute STORM Import Contract Mapper.
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

def main():
    """
    Runtime Entry Point.
    """

    return mapper()


if __name__ == "__main__":

    main()