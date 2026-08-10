#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/dynabook/observe_listing.py

SHIN CORE LINX

dynabook Manufacturer Reality Observation Runtime

Reality First
Observation First
Semantic Later


Runtime Flow

    AcquisitionDocument
            │
            ▼
      dynabook HTML
            │
            ▼
      .pc_spec_table
            │
            ▼
     Specification Reality
            │
            ▼
        Observation
            │
            ▼
    Observation Store Runtime


Responsibilities

- Read acquired dynabook product HTML
- Detect dynabook specification table
- Extract published specification labels
- Extract published specification values
- Preserve manufacturer terminology
- Preserve raw specification text
- Report Reality availability


NOT Responsibilities

- Price extraction
- Affiliate generation
- URL resolution
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
- PCProduct persistence


IMPORTANT

The Observer preserves manufacturer Reality.

Example:

    <tr>
        <td>CPU</td>
        <td>インテル Core 5 プロセッサー 120U</td>
    </tr>

MUST become:

    {
        "label": "CPU",
        "value": "インテル Core 5 プロセッサー 120U"
    }


Likewise:

    <td>メモリ</td>
    <td>16GB(16GB×1)/最大32GB</td>

MUST remain exactly as published:

    {
        "label": "メモリ",
        "value": "16GB(16GB×1)/最大32GB"
    }


The Observer MUST NOT decide:

    memory_gb = 16

    cpu_model = "Intel Core 5 120U"

    storage_gb = 512

    display_info = ...


Those are Semantic / AI Runtime responsibilities.

Reality is observed first.

==============================================================================
"""

from __future__ import annotations


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

# ------------------------------------------------------------------------------
# dynabook specification table
# ------------------------------------------------------------------------------

DYNABOOK_SPEC_TABLE_SELECTOR = (
    "table.pc_spec_table"
)


DYNABOOK_SPEC_ROW_SELECTOR = (
    "tbody > tr"
)


DYNABOOK_SPEC_LABEL_SELECTOR = (
    "td:nth-child(1)"
)


DYNABOOK_SPEC_VALUE_SELECTOR = (
    "td:nth-child(2)"
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

    Examples
    --------
    "  CPU  "
        ->
    "CPU"

    "16GB(16GB×1)/最大32GB"
        ->
    "16GB(16GB×1)/最大32GB"
    """

    if not value:

        return ""

    return " ".join(
        str(value).split()
    ).strip()


# ==============================================================================
# Specification Table
# ==============================================================================

def find_spec_table(
    soup: BeautifulSoup,
):
    """
    Find dynabook published specification table.

    Expected Reality:

        <table class="pc_spec_table">
            <tbody>
                <tr>
                    <td>OS</td>
                    <td>Windows 11 Pro 64ビット</td>
                </tr>
                ...
            </tbody>
        </table>

    Returns
    -------
    Tag | None
        Specification table.
    """

    return soup.select_one(
        DYNABOOK_SPEC_TABLE_SELECTOR
    )


# ==============================================================================
# Specification Observation
# ==============================================================================

def observe_specifications(
    soup: BeautifulSoup,
) -> list[dict[str, str]]:
    """
    Extract published dynabook specifications.

    Runtime responsibility:

        HTML
          ↓
        Published specification
          ↓
        Observation

    No semantic normalization is performed.
    """

    table = find_spec_table(
        soup
    )

    if not table:

        return []

    specifications: list[
        dict[str, str]
    ] = []

    rows = table.select(
        DYNABOOK_SPEC_ROW_SELECTOR
    )

    for row in rows:

        cells = row.find_all(
            "td",
            recursive=False,
        )

        # ----------------------------------------------------------------------
        # A valid dynabook specification row
        # contains:
        #
        #   td = label
        #   td = value
        #
        # ----------------------------------------------------------------------

        if len(cells) < 2:

            continue

        label = clean_text(
            cells[0].get_text(
                " ",
                strip=True,
            )
        )

        value = clean_text(
            cells[1].get_text(
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
# Raw Specification Text
# ==============================================================================

def observe_raw_spec_text(
    soup: BeautifulSoup,
) -> str:
    """
    Preserve raw published specification text.

    The text is taken directly from the dynabook
    specification table.

    No semantic transformation is performed.
    """

    table = find_spec_table(
        soup
    )

    if not table:

        return ""

    return clean_text(
        table.get_text(
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
    Convert one dynabook AcquisitionDocument
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
    # Published Specification Reality
    # --------------------------------------------------------------------------

    specifications = (
        observe_specifications(
            soup
        )
    )

    # --------------------------------------------------------------------------
    # Raw Specification Reality
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

        specification_source = (
            "pc_spec_table"
        )

    else:

        reality_status = (
            "UNAVAILABLE"
        )

        specification_source = (
            "none"
        )

    # --------------------------------------------------------------------------
    # Observation
    # --------------------------------------------------------------------------

    return {

        # ----------------------------------------------------------------------
        # Source
        # ----------------------------------------------------------------------

        "source": (
            "dynabook"
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
            "DYNABOOK_PRODUCT"
        ),

        "reality": (
            reality_status
        ),

        "specification_source": (
            specification_source
        ),

        # ----------------------------------------------------------------------
        # Published Specification Reality
        # ----------------------------------------------------------------------

        "specifications": (
            specifications
        ),

        # ----------------------------------------------------------------------
        # Raw Specification Text
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
    Execute dynabook Observation Runtime.

    Input
    -----
    AcquisitionDocument

    Output
    ------
    list[dict]
        Observation Reality.


    IMPORTANT

    Price is intentionally NOT observed.

    PCProduct already has price Reality.

    This Runtime is responsible only for acquiring
    manufacturer specification Reality.
    """

    trace_pipeline(
        "dynabook LISTING OBSERVATION",
    )

    print()

    print(
        "=" * 70
    )

    print(
        "dynabook LISTING OBSERVATION"
    )

    print(
        "=" * 70
    )

    # ==========================================================================
    # AcquisitionDocument Query
    # ==========================================================================

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
            "URL        : "
            f"{document.source_url}"
        )

        print(
            "FORMAT     : "
            f"{observation['format']}"
        )

        print(
            "REALITY    : "
            f"{reality}"
        )

        print(
            "SOURCE     : "
            f"{specification_source}"
        )

        print(
            "SPECS      : "
            f"{len(specifications)}"
        )

        # ----------------------------------------------------------------------
        # Specification Preview
        # ----------------------------------------------------------------------

        for item in specifications:

            print(
                f"{item['label']} : "
                f"{item['value']}"
            )

    # ==========================================================================
    # Result
    # ==========================================================================

    print()

    print(
        "=" * 70
    )

    print(
        "dynabook LISTING OBSERVATION RESULT"
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