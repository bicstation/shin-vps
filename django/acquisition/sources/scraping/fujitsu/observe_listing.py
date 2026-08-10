#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/fujitsu/observe_listing.py

SHIN CORE LINX

FUJITSU / FMV Manufacturer Reality Observation Runtime

Reality First
Observation First
Semantic Later

Runtime Flow

    AcquisitionDocument
            │
            ▼
        FMV HTML
            │
            ├── HTML DOM
            │
            └── Embedded Product JSON
                    │
                    ▼
        FMV Reality Observer
                    │
                    ▼
             Observation
                    │
                    ▼
          PCProduct.observation


Responsibilities

- Read acquired FUJITSU / FMV product HTML
- Detect FMV specification HTML structure
- Detect FMV embedded product data
- Extract published specification text
- Extract published product number
- Preserve manufacturer terminology
- Preserve raw specification text
- Preserve published specification codes
- Report HTML observation results

NOT Responsibilities

- Semantic classification
- CPU mapping
- GPU mapping
- Memory normalization
- Storage normalization
- Display normalization
- Attribute mapping
- Product building
- AI analysis
- Semantic processing
- Database persistence


IMPORTANT

The Observer preserves published manufacturer Reality.

Example:

    CPU
    インテル Core Ultra 5 125U｜インテル Core Ultra 7 155H

MUST remain:

    {
        "label": "CPU",
        "value":
            "インテル Core Ultra 5 125U｜インテル Core Ultra 7 155H",
        "code": "LOIS_SCA_CPU"
    }

Likewise:

    8GB｜16GB｜32GB｜64GB

MUST remain exactly as published.

The Observer MUST NOT decide:

    cpu_model = ...

    memory_gb = ...

    storage_gb = ...

Reality is observed first.

==============================================================================
"""

from __future__ import annotations


import json
import re


from bs4 import BeautifulSoup


from api.models import (
    AcquisitionDocument,
)


from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)


from .settings import (
    SOURCE_NAME,
)


# ==============================================================================
# Constants
# ==============================================================================

FMV_SPEC_ROOT_SELECTOR = (
    ".system_specs_container"
)

FMV_SPEC_ITEM_SELECTOR = (
    ".specs_item"
)

FMV_SPEC_LABEL_SELECTOR = (
    ".item_name"
)

FMV_SPEC_VALUE_SELECTOR = (
    ".item_content"
)

FMV_PRODUCT_NUMBER_SELECTOR = (
    ".part_number_content"
)


# ==============================================================================
# Embedded JSON Markers
# ==============================================================================

# FMV pages observed during Reality Research contain
# published product attributes represented in structures
# equivalent to:
#
# {
#     "a": "CPU",
#     "b": "インテル Core Ultra 5 125U｜インテル Core Ultra 7 155H",
#     "code": "LOIS_SCA_CPU"
# }
#
# The observer searches the HTML source for these objects.
#
# No semantic interpretation is performed.


EMBEDDED_ATTRIBUTE_LABEL_KEY = (
    "a"
)

EMBEDDED_ATTRIBUTE_VALUE_KEY = (
    "b"
)

EMBEDDED_ATTRIBUTE_CODE_KEY = (
    "code"
)


# ==============================================================================
# Text
# ==============================================================================

def clean_text(
    value: str | None,
) -> str:
    """
    Normalize surrounding HTML whitespace only.

    No semantic transformation is performed.
    """

    if not value:

        return ""

    return " ".join(
        str(value).split()
    ).strip()


# ==============================================================================
# Product Number
# ==============================================================================

def observe_product_number(
    soup: BeautifulSoup,
) -> str:
    """
    Extract published FMV product number.

    Example:

        製品番号 : K1TTCTO1WWJP2

    Returns:

        K1TTCTO1WWJP2
    """

    element = soup.select_one(
        FMV_PRODUCT_NUMBER_SELECTOR
    )

    if not element:

        return ""

    text = clean_text(
        element.get_text(
            " ",
            strip=True,
        )
    )

    # --------------------------------------------------------------------------
    # Normal FMV structure
    #
    # .part_number_content
    # contains:
    #
    #     : K1TTCTO1WWJP2
    #
    # Remove only the published presentation delimiter.
    # --------------------------------------------------------------------------

    text = text.lstrip(
        ":："
    ).strip()

    return text


# ==============================================================================
# HTML Specification Reality
# ==============================================================================

def observe_html_specifications(
    soup: BeautifulSoup,
) -> list[dict[str, str]]:
    """
    Extract published FMV specification Reality
    from the visible HTML specification structure.

    HTML structure:

        .system_specs_container
            .specs_item
                .item_name
                .item_content

    No semantic interpretation is performed.
    """

    specifications: list[
        dict[str, str]
    ] = []

    root = soup.select_one(
        FMV_SPEC_ROOT_SELECTOR
    )

    if not root:

        return specifications

    items = root.select(
        FMV_SPEC_ITEM_SELECTOR
    )

    for item in items:

        label_element = (
            item.select_one(
                FMV_SPEC_LABEL_SELECTOR
            )
        )

        value_element = (
            item.select_one(
                FMV_SPEC_VALUE_SELECTOR
            )
        )

        if not label_element:

            continue

        if not value_element:

            continue

        label = clean_text(
            label_element.get_text(
                " ",
                strip=True,
            )
        )

        value = clean_text(
            value_element.get_text(
                " ",
                strip=True,
            )
        )

        if not label:

            continue

        if not value:

            continue

        specifications.append(
            {
                "label": label,
                "value": value,
            }
        )

    return specifications


# ==============================================================================
# Embedded JSON Candidate Extraction
# ==============================================================================

def extract_json_objects(
    html: str,
) -> list[dict]:
    """
    Extract JSON-like objects from FMV HTML.

    This is intentionally conservative.

    The FMV page can contain escaped JSON embedded
    inside JavaScript / application state.

    We attempt several decoding layers before
    parsing JSON.

    No semantic interpretation is performed.
    """

    if not html:

        return []

    candidates: list[dict] = []

    # --------------------------------------------------------------------------
    # Candidate text sources
    # --------------------------------------------------------------------------

    sources: list[str] = [
        html,
    ]

    # HTML entity decoding
    try:

        soup = BeautifulSoup(
            html,
            "html.parser",
        )

        text = soup.get_text(
            " ",
            strip=False,
        )

        if text:

            sources.append(
                text
            )

    except Exception:

        pass

    # --------------------------------------------------------------------------
    # Search balanced JSON objects
    # --------------------------------------------------------------------------

    for source in sources:

        length = len(source)

        index = 0

        while index < length:

            if source[index] != "{":

                index += 1

                continue

            depth = 0

            in_string = False

            escaped = False

            end = None

            for position in range(
                index,
                length,
            ):

                character = source[
                    position
                ]

                if in_string:

                    if escaped:

                        escaped = False

                    elif character == "\\":

                        escaped = True

                    elif character == '"':

                        in_string = False

                    continue

                if character == '"':

                    in_string = True

                    continue

                if character == "{":

                    depth += 1

                elif character == "}":

                    depth -= 1

                    if depth == 0:

                        end = position + 1

                        break

            if end is None:

                index += 1

                continue

            candidate = source[
                index:end
            ]

            # Avoid scanning huge unrelated objects repeatedly.
            if len(candidate) > 500000:

                index = end

                continue

            try:

                parsed = json.loads(
                    candidate
                )

                if isinstance(
                    parsed,
                    dict,
                ):

                    candidates.append(
                        parsed
                    )

            except Exception:

                pass

            index = end

    return candidates


# ==============================================================================
# Embedded Attribute Detection
# ==============================================================================

def observe_embedded_attributes(
    html: str,
) -> list[dict[str, str]]:
    """
    Observe FMV published attributes from embedded page data.

    Expected published structure:

        {
            "a": "CPU",
            "b":
                "インテル Core Ultra 5 125U｜インテル Core Ultra 7 155H",
            "code": "LOIS_SCA_CPU"
        }

    Output:

        {
            "label": "CPU",
            "value":
                "インテル Core Ultra 5 125U｜インテル Core Ultra 7 155H",
            "code": "LOIS_SCA_CPU"
        }

    The keys themselves are treated only as
    FMV published data structure.

    No semantic mapping occurs.
    """

    if not html:

        return []

    attributes: list[
        dict[str, str]
    ] = []

    # --------------------------------------------------------------------------
    # Direct JSON object extraction
    # --------------------------------------------------------------------------

    objects = extract_json_objects(
        html
    )

    for obj in objects:

        label = obj.get(
            EMBEDDED_ATTRIBUTE_LABEL_KEY
        )

        value = obj.get(
            EMBEDDED_ATTRIBUTE_VALUE_KEY
        )

        code = obj.get(
            EMBEDDED_ATTRIBUTE_CODE_KEY
        )

        if not isinstance(
            label,
            str,
        ):

            continue

        if not isinstance(
            value,
            str,
        ):

            continue

        label = clean_text(
            label
        )

        value = clean_text(
            value
        )

        if not label:

            continue

        if not value:

            continue

        item = {
            "label": label,
            "value": value,
        }

        if isinstance(
            code,
            str,
        ):

            code = clean_text(
                code
            )

            if code:

                item[
                    "code"
                ] = code

        attributes.append(
            item
        )

    # --------------------------------------------------------------------------
    # Fallback regex
    #
    # FMV source can contain escaped JSON or JavaScript
    # representations that are not directly parseable.
    #
    # Example:
    #
    # "a":"CPU","b":"...","code":"LOIS_SCA_CPU"
    #
    # --------------------------------------------------------------------------

    if not attributes:

        pattern = re.compile(
            r'"a"\s*:\s*"([^"]*)"\s*,'
            r'\s*"b"\s*:\s*"([^"]*)"\s*,'
            r'\s*"code"\s*:\s*"([^"]*)"',
            re.DOTALL,
        )

        for match in pattern.finditer(
            html
        ):

            label = clean_text(
                match.group(1)
            )

            value = clean_text(
                match.group(2)
            )

            code = clean_text(
                match.group(3)
            )

            if not label:

                continue

            if not value:

                continue

            item = {
                "label": label,
                "value": value,
            }

            if code:

                item[
                    "code"
                ] = code

            attributes.append(
                item
            )

    # --------------------------------------------------------------------------
    # De-duplicate exact Reality
    # --------------------------------------------------------------------------

    unique: list[
        dict[str, str]
    ] = []

    seen: set[
        tuple[str, str, str]
    ] = set()

    for item in attributes:

        key = (
            item.get(
                "label",
                "",
            ),
            item.get(
                "value",
                "",
            ),
            item.get(
                "code",
                "",
            ),
        )

        if key in seen:

            continue

        seen.add(
            key
        )

        unique.append(
            item
        )

    return unique


# ==============================================================================
# Raw Specification Text
# ==============================================================================

def observe_raw_spec_text(
    soup: BeautifulSoup,
) -> str:
    """
    Preserve the complete published specification
    text contained in the FMV specification container.

    This is intentionally retained as raw Reality.

    No semantic interpretation is performed.
    """

    root = soup.select_one(
        FMV_SPEC_ROOT_SELECTOR
    )

    if not root:

        return ""

    return clean_text(
        root.get_text(
            " ",
            strip=True,
        )
    )


# ==============================================================================
# One Document
# ==============================================================================

def observe_document(
    document: AcquisitionDocument,
) -> dict:
    """
    Convert one FMV AcquisitionDocument
    into Observation Reality.
    """

    html = (
        document.content
        or ""
    )

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    # --------------------------------------------------------------------------
    # Published Identity
    # --------------------------------------------------------------------------

    product_number = (
        observe_product_number(
            soup
        )
    )

    # --------------------------------------------------------------------------
    # Visible HTML Reality
    # --------------------------------------------------------------------------

    html_specifications = (
        observe_html_specifications(
            soup
        )
    )

    # --------------------------------------------------------------------------
    # Embedded FMV Reality
    # --------------------------------------------------------------------------

    embedded_specifications = (
        observe_embedded_attributes(
            html
        )
    )

    # --------------------------------------------------------------------------
    # Choose observed specification source
    #
    # Embedded FMV product data is preferred when available,
    # because it contains the published attribute/code structure.
    #
    # HTML structure remains available as fallback.
    # --------------------------------------------------------------------------

    if embedded_specifications:

        specifications = (
            embedded_specifications
        )

        specification_source = (
            "embedded_product_data"
        )

    elif html_specifications:

        specifications = (
            html_specifications
        )

        specification_source = (
            "html_dom"
        )

    else:

        specifications = []

        specification_source = (
            "none"
        )

    # --------------------------------------------------------------------------
    # Raw visible specification text
    # --------------------------------------------------------------------------

    raw_text = (
        observe_raw_spec_text(
            soup
        )
    )

    # --------------------------------------------------------------------------
    # Reality Status
    # --------------------------------------------------------------------------

    if specifications:

        reality_status = (
            "AVAILABLE"
        )

    else:

        reality_status = (
            "UNAVAILABLE"
        )

    # --------------------------------------------------------------------------
    # Observation
    # --------------------------------------------------------------------------

    return {

        # ----------------------------------------------------------------------
        # Source
        # ----------------------------------------------------------------------

        "source": (
            "fujitsu"
        ),

        "source_url": (
            document.source_url
        ),

        "document_key": (
            document.document_key
        ),

        # ----------------------------------------------------------------------
        # Observation Format
        # ----------------------------------------------------------------------

        "format": (
            "FMV_PRODUCT"
        ),

        "reality": (
            reality_status
        ),

        "specification_source": (
            specification_source
        ),

        # ----------------------------------------------------------------------
        # Published Product Identity
        # ----------------------------------------------------------------------

        "product_number": (
            product_number
        ),

        # ----------------------------------------------------------------------
        # Published Specification Reality
        # ----------------------------------------------------------------------

        "specifications": (
            specifications
        ),

        # ----------------------------------------------------------------------
        # Visible Raw Specification Text
        # ----------------------------------------------------------------------

        "raw_text": (
            raw_text
        ),
    }


# ==============================================================================
# Runtime
# ==============================================================================

def observe_listing() -> list[dict]:
    """
    Execute FUJITSU / FMV Observation Runtime.

    Input:

        AcquisitionDocument

    Output:

        Observation Reality
    """

    trace_pipeline(
        "FUJITSU / FMV LISTING OBSERVATION",
    )

    print()

    print(
        "=" * 70
    )

    print(
        "FUJITSU / FMV LISTING OBSERVATION"
    )

    print(
        "=" * 70
    )

    documents = (
        AcquisitionDocument.objects

        .filter(
            source_type="scraping",
            source_name=SOURCE_NAME,
            document_type="product",
        )

        .exclude(
            content="",
        )

        .order_by(
            "document_key",
        )

        .iterator()
    )

    total = 0

    available = 0

    unavailable = 0

    observations: list[
        dict
    ] = []

    # ==========================================================================
    # Documents
    # ==========================================================================

    for document in documents:

        total += 1

        observation = (
            observe_document(
                document
            )
        )

        observations.append(
            observation
        )

        reality = observation[
            "reality"
        ]

        specifications = (
            observation[
                "specifications"
            ]
        )

        product_number = (
            observation[
                "product_number"
            ]
        )

        specification_source = (
            observation[
                "specification_source"
            ]
        )

        if reality == "AVAILABLE":

            available += 1

        else:

            unavailable += 1

        # ----------------------------------------------------------------------
        # Display
        # ----------------------------------------------------------------------

        print()

        print(
            "=" * 70
        )

        print(
            f"[{total:03}] "
            f"{document.document_key}"
        )

        print(
            f"URL        : "
            f"{document.source_url}"
        )

        print(
            f"FORMAT     : "
            f"{observation['format']}"
        )

        print(
            f"REALITY    : "
            f"{reality}"
        )

        print(
            f"SOURCE     : "
            f"{specification_source}"
        )

        print(
            f"PRODUCT NO : "
            f"{product_number}"
        )

        print(
            f"SPECS      : "
            f"{len(specifications)}"
        )

        # ----------------------------------------------------------------------
        # Specification Preview
        # ----------------------------------------------------------------------

        for item in specifications[:12]:

            print(
                "  "
                f"{item['label']}"
                " : "
                f"{item['value']}"
            )

            if item.get(
                "code"
            ):

                print(
                    "    CODE : "
                    f"{item['code']}"
                )

        if len(specifications) > 12:

            print(
                "  ..."
                f"+{len(specifications) - 12}"
            )

    # ==========================================================================
    # Result
    # ==========================================================================

    print()

    print(
        "=" * 70
    )

    print(
        "FUJITSU / FMV LISTING OBSERVATION RESULT"
    )

    print(
        "=" * 70
    )

    print(
        f"PRODUCTS    : {total}"
    )

    print(
        f"AVAILABLE   : {available}"
    )

    print(
        f"UNAVAILABLE : {unavailable}"
    )

    print(
        f"RETURNED    : {len(observations)}"
    )

    print(
        "=" * 70
    )

    # ==========================================================================
    # Return Observation Reality
    # ==========================================================================

    return observations


# ==============================================================================
# Entry Point
# ==============================================================================

def main() -> list[dict]:
    """
    Runtime Entry Point.
    """

    return observe_listing()


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()