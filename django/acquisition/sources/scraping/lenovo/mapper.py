#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/lenovo/mapper.py

SHIN CORE LINX

LENOVO OpenAPI Import Contract Mapper

Formatter Runtime
        │
        ▼
Import Contract
        │
        ▼
Writer
        │
        ▼
ImportDocument

Reality First
Observation First
Translation Authority

Responsibilities

- Receive Formatter Runtime
- Translate Runtime Contract
- Build Identity Contract
- Build Commerce Contract
- Build Media Contract
- Build Affiliate Contract
- Build Category Contract
- Build Observation Runtime
- Validate Import Contract

NOT Responsibilities

- HTTP Acquisition
- HTML Parsing
- Reality Observation
- Formatter
- ImportDocument Persistence
- PCProduct Construction
- Semantic Processing

==============================================================================

Important

Mapper receives Runtime Contracts from Formatter.

Mapper does NOT call formatter_openapi.

Formatter is responsible for:

- URL normalization
- Main image resolution
- Media normalization

Mapper is responsible for:

- Identity translation
- Commerce translation
- Media translation
- Affiliate generation
- Contract construction

==============================================================================

Runtime Contract Reality

published
│
├── product_code
├── product_name
├── model
├── machine_type
├── url
├── source_url
├── image_url
├── media
├── specifications
├── category_path
└── raw
      ├── productCode
      ├── productName
      ├── machineType
      └── ...

==============================================================================

"""

from __future__ import annotations


from typing import (
    Any,
)


from acquisition.common.affiliate.affiliate import (
    generate_affiliate_url,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    AFFILIATE,
    SITE_NAME,
)


# ==============================================================================
# Runtime Constants
# ==============================================================================

SOURCE_PREFIX = SITE_NAME.upper()


# ==============================================================================
# Runtime Utilities
# ==============================================================================

def normalize_text(
    value: Any,
) -> str:
    """
    Normalize text without changing meaning.
    """

    if value is None:

        return ""

    if isinstance(
        value,
        str,
    ):

        return value.strip()

    return str(
        value
    ).strip()


def normalize_list(
    value: Any,
) -> list:
    """
    Normalize Runtime value into list.
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
    Normalize Runtime value into dict.
    """

    if isinstance(
        value,
        dict,
    ):

        return value

    return {}


# ==============================================================================
# Published Runtime Access
# ==============================================================================

def get_published(
    runtime: dict,
) -> dict:
    """
    Get Formatter Published Runtime.
    """

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

    return published


def get_raw(
    published: dict,
) -> dict:
    """
    Get original OpenAPI Reality.

    Used only where the Formatter Runtime
    does not expose a normalized identity field.

    No semantic inference.
    """

    raw = published.get(
        "raw",
        {},
    )

    if not isinstance(
        raw,
        dict,
    ):

        return {}

    return raw


# ==============================================================================
# Runtime Identity Access
# ==============================================================================

def get_product_code(
    published: dict,
) -> str:
    """
    Resolve Lenovo productCode.

    Published Runtime currently preserves
    the authoritative OpenAPI value under raw.
    """

    value = normalize_text(

        published.get(
            "product_code",
        )

    )

    if value:

        return value

    raw = get_raw(
        published,
    )

    return normalize_text(

        raw.get(
            "productCode",
        )

    )


def get_product_name(
    published: dict,
) -> str:
    """
    Resolve Lenovo productName.
    """

    value = normalize_text(

        published.get(
            "product_name",
        )

    )

    if value:

        return value

    raw = get_raw(
        published,
    )

    return normalize_text(

        raw.get(
            "productName",
        )

    )


def get_model(
    published: dict,
) -> str:
    """
    Resolve published model.

    Do not invent model values.
    """

    return normalize_text(

        published.get(
            "model",
        )

    )


def get_machine_type(
    published: dict,
) -> str:
    """
    Resolve Lenovo machineType.
    """

    value = normalize_text(

        published.get(
            "machine_type",
        )

    )

    if value:

        return value

    raw = get_raw(
        published,
    )

    return normalize_text(

        raw.get(
            "machineType",
        )

    )


# ==============================================================================
# Identifier
# ==============================================================================

def normalize_identifier(
    value: Any,
) -> str:
    """
    Normalize identifier structurally.

    No semantic transformation.
    """

    value = normalize_text(
        value
    )

    return (
        value
        .replace(
            " ",
            "_",
        )
        .replace(
            "/",
            "_",
        )
    )


def build_unique_id(
    published: dict,
) -> str:
    """
    Build Lenovo Runtime Unique ID.

    Primary Reality:
        productCode

    Fallback:
        machineType
        productName

    No guessed SKU.
    """

    product_code = get_product_code(
        published,
    )

    machine_type = get_machine_type(
        published,
    )

    product_name = get_product_name(
        published,
    )

    identifier = (

        product_code
        or machine_type
        or product_name

    )

    if not identifier:

        raise ValueError(
            "Unable to build Lenovo unique_id."
        )

    return (

        f"{SOURCE_PREFIX}_"
        f"{normalize_identifier(identifier)}"

    )


# ==============================================================================
# Identity Contract
# ==============================================================================

def build_identity(
    runtime: dict,
) -> dict:
    """
    Build Lenovo Identity Contract.
    """

    published = get_published(
        runtime,
    )

    product_code = get_product_code(
        published,
    )

    product_name = get_product_name(
        published,
    )

    model = get_model(
        published,
    )

    machine_type = get_machine_type(
        published,
    )

    product_url = normalize_text(

        published.get(
            "url",
        )

    )

    return {

        "unique_id":
            build_unique_id(
                published,
            ),

        "maker":
            SITE_NAME,

        "brand":
            "",

        "series":
            "ThinkPad",

        "collaboration":
            "",

        "model":
            model,

        "product_no":
            product_code,

        "sku":
            product_code,

        "product_name":
            product_name,

        "product_url":
            product_url,

        "machine_type":
            machine_type,

    }
    
 # ==============================================================================
# Commerce Contract
# ==============================================================================

def build_commerce(
    runtime: dict,
) -> dict:
    """
    Build Lenovo Commerce Contract.

    Preserve published commerce Reality.
    """

    published = get_published(
        runtime,
    )

    return {
        
        "price":
            published.get(
                "web_price",
            ),

        "web_price":
            published.get(
                "web_price",
            ),

        "final_price":
            published.get(
                "final_price",
            ),

        "tax_price":
            published.get(
                "tax_price",
            ),

        "marketing_status":
            normalize_text(
                published.get(
                    "marketing_status",
                )
            ),

        "inventory_status":
            normalize_text(
                published.get(
                    "inventory_status",
                )
            ),

        "lead_time":
            normalize_text(
                published.get(
                    "lead_time",
                )
            ),

    }


# ==============================================================================
# Media Contract
# ==============================================================================

def build_media(
    runtime: dict,
) -> dict:
    """
    Build Lenovo Media Contract.

    Formatter has already resolved image_url.

    Mapper does not parse OpenAPI media again.
    """

    published = get_published(
        runtime,
    )

    image_url = normalize_text(

        published.get(
            "image_url",
        )

    )

    media = normalize_dict(

        published.get(
            "media",
            {},
        )

    )

    return {

        "image_url":
            image_url,

        "media":
            media,

    }


# ==============================================================================
# Affiliate Contract
# ==============================================================================

def build_affiliate(
    runtime: dict,
) -> dict:
    """
    Build Lenovo Affiliate Contract.

    Affiliate generation belongs to Mapper.

    Source URL:
        Formatter normalized published.url
    """

    published = get_published(
        runtime,
    )

    product_url = normalize_text(

        published.get(
            "url",
        )

    )

    if not product_url:

        raise ValueError(
            "Lenovo product URL is empty."
        )

    affiliate_url = generate_affiliate_url(

        product_url,

        AFFILIATE,

    )

    return {
        
        "url":
            product_url,

        "original_url":
            product_url,

        "affiliate_url":
            affiliate_url,

    }


# ==============================================================================
# Category Contract
# ==============================================================================

def build_category(
    runtime: dict,
) -> dict:
    """
    Build Category Contract.

    Preserve published category Reality.
    """

    published = get_published(
        runtime,
    )

    category_path = normalize_list(

        published.get(
            "category_path",
            [],
        )

    )

    return {

        "category_path":
            category_path,

        "manual_subseries_code":
            normalize_text(

                published.get(
                    "manual_subseries_code",
                )

            ),

        "parent_subseries_id":
            normalize_text(

                published.get(
                    "parent_subseries_id",
                )

            ),

    }


# ==============================================================================
# Observation Runtime
# ==============================================================================

def build_observation_runtime(
    runtime: dict,
) -> dict:
    """
    Build Observation Runtime.

    Preserve normalized Published Reality.

    No semantic interpretation.
    """

    published = get_published(
        runtime,
    )

    return {

        "product_code":
            get_product_code(
                published,
            ),

        "product_name":
            get_product_name(
                published,
            ),

        "model":
            get_model(
                published,
            ),

        "machine_type":
            get_machine_type(
                published,
            ),

        "url":
            normalize_text(

                published.get(
                    "url",
                )

            ),

        "source_url":
            normalize_text(

                published.get(
                    "source_url",
                )

            ),

        "image_url":
            normalize_text(

                published.get(
                    "image_url",
                )

            ),

        "media":
            normalize_dict(

                published.get(
                    "media",
                    {},
                )

            ),

        "specifications":
            normalize_list(

                published.get(
                    "specifications",
                    [],
                )

            ),

        "category_path":
            normalize_list(

                published.get(
                    "category_path",
                    [],
                )

            ),

        "raw":
            normalize_dict(

                published.get(
                    "raw",
                    {},
                )

            ),

    }


# ==============================================================================
# Import Contract
# ==============================================================================

def build_contract(
    runtime: dict,
) -> dict:
    """
    Build complete Lenovo Import Contract.

    Flow

        Formatter Runtime
                ↓
            Identity
            Commerce
            Media
            Affiliate
            Category
            Observation
                ↓
        Import Contract
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
        # Category
        #

        "category":
            build_category(
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
# Contract Validation
# ==============================================================================

def validate_contract(
    contract: dict,
) -> None:
    """
    Validate Import Contract structure.

    Structural validation only.

    Mapper does not modify the contract
    during validation.
    """

    required = (

        "identity",

        "commerce",

        "media",

        "affiliate",

        "category",

        "observation_runtime",

    )

    missing = [

        field

        for field in required

        if field not in contract

    ]

    if missing:

        raise ValueError(

            "Import Contract missing fields: "

            + ", ".join(
                missing
            )

        )

    identity = normalize_dict(

        contract.get(
            "identity",
        )

    )

    if not identity.get(
        "unique_id"
    ):

        raise ValueError(
            "Import Contract has empty "
            "unique_id."
        )

    if not identity.get(
        "product_url"
    ):

        raise ValueError(
            "Import Contract has empty "
            "product_url."
        )


# ==============================================================================
# Mapper Runtime
# ==============================================================================

def mapper(
    runtimes: list[dict],
) -> list[dict]:
    """
    Execute Lenovo OpenAPI Import Contract Mapper.

    Parameters
    ----------
    runtimes:
        Runtime Contracts produced by Formatter.

    Returns
    -------
    list[dict]
        Lenovo Import Contracts.

    Mapper receives Formatter output.

    Mapper does NOT call Formatter.
    """

    trace_pipeline(
        "MAPPER",
    )

    print()

    print("=" * 70)

    print(
        f"{SITE_NAME.upper()} OPENAPI "
        "IMPORT CONTRACT MAPPER"
    )

    print("=" * 70)

    contracts: list[dict] = []

    failed = 0

    for runtime in runtimes:

        try:

            contract = build_contract(
                runtime,
            )

            validate_contract(
                contract,
            )

        except Exception as exc:

            failed += 1

            print(
                "FAILED : "
                f"{exc}"
            )

            continue

        contracts.append(
            contract
        )

        identity = contract[
            "identity"
        ]

        print(
            f"MAP    : "
            f"{identity['unique_id']} "
            f"{identity['product_name']}"
        )

    print()

    print("=" * 70)

    print("MAPPER RESULT")

    print("=" * 70)

    print(
        f"Runtime Contracts : "
        f"{len(runtimes)}"
    )

    print(
        f"Import Contracts  : "
        f"{len(contracts)}"
    )

    print(
        f"Failed            : "
        f"{failed}"
    )

    print("=" * 70)

    return contracts


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    *,
    runtimes: list[dict],
) -> list[dict]:
    """
    Runtime Entry Point.

    Receives Formatter Runtime
    from Pipeline.
    """

    return mapper(
        runtimes,
    )


# ==============================================================================
# Standalone Execution
# ==============================================================================

if __name__ == "__main__":

    raise RuntimeError(
        "mapper.py must be executed "
        "from the Runtime Pipeline."
    )   