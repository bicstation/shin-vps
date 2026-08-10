#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/dell/observe_listing.py

SHIN CORE LINX

DELL Manufacturer Reality Observation Runtime

Responsibilities

- Read acquired DELL product HTML
- Detect DELL specification HTML structures
- Extract published specification text
- Preserve manufacturer terminology
- Report HTML format distribution

NOT

- Semantic classification
- CPU/GPU mapping
- AI analysis
- Product building
- Attribute mapping
- Semantic processing

==============================================================================

Reality

AcquisitionDocument
        │
        ▼
    DELL HTML
        │
        ├── FORMAT A
        │   data-bind="html: techSpecs"
        │       └── ul.specs > li
        │
        └── FORMAT B
            #techspecs_section
                └── .spec__main_wrapper
                       └── .spec__item
        │
        ▼
   Specification Reality
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
# Text
# ==============================================================================

def clean_text(
    value: str | None,
) -> str:

    if not value:
        return ""

    return " ".join(
        value.split()
    ).strip()


# ==============================================================================
# FORMAT A
#
# <div data-bind="html: techSpecs">
#     <ul class="specs">
#         <li>
#             <div>プロセッサー</div>
#             <p>AMD Ryzen...</p>
#         </li>
#     </ul>
# </div>
# ==============================================================================

def observe_format_a(
    soup: BeautifulSoup,
) -> list[dict]:

    results: list[dict] = []

    roots = soup.select(
        '[data-bind="html: techSpecs"]'
    )

    for root in roots:

        items = root.select(
            "ul.specs > li"
        )

        for item in items:

            label_element = item.select_one(
                ".h5"
            )

            if not label_element:

                label_element = item.find(
                    recursive=False
                )

            if not label_element:

                continue

            label = clean_text(
                label_element.get_text(
                    " ",
                    strip=True,
                )
            )

            # Remove label element so only
            # published values remain.

            label_element.extract()

            value = clean_text(
                item.get_text(
                    " ",
                    strip=True,
                )
            )

            if not label or not value:

                continue

            results.append(
                {
                    "label": label,
                    "value": value,
                }
            )

    return results


# ==============================================================================
# FORMAT B
#
# <section id="techspecs_section">
#     <div class="spec__main_wrapper">
#         <div class="spec__child__heading">
#             仕様
#         </div>
#
#         <div class="spec__child">
#             <div class="spec__item">
#                 <div class="spec__item__title">
#                     画面サイズクラス
#                 </div>
#                 32インチ
#             </div>
#         </div>
#     </div>
# </section>
# ==============================================================================

def observe_format_b(
    soup: BeautifulSoup,
) -> list[dict]:

    results: list[dict] = []

    root = soup.select_one(
        "#techspecs_section"
    )

    if not root:

        return results

    wrappers = root.select(
        ".spec__main_wrapper"
    )

    for wrapper in wrappers:

        heading_element = wrapper.select_one(
            ".spec__child__heading"
        )

        section_name = ""

        if heading_element:

            section_name = clean_text(
                heading_element.get_text(
                    " ",
                    strip=True,
                )
            )

        items = wrapper.select(
            ".spec__item"
        )

        for item in items:

            title_element = item.select_one(
                ".spec__item__title"
            )

            if not title_element:

                continue

            label = clean_text(
                title_element.get_text(
                    " ",
                    strip=True,
                )
            )

            # Remove title from item so
            # remaining text represents value.

            title_element.extract()

            value = clean_text(
                item.get_text(
                    " ",
                    strip=True,
                )
            )

            if not label or not value:

                continue

            results.append(
                {
                    "section": section_name,
                    "label": label,
                    "value": value,
                }
            )

    return results


# ==============================================================================
# Generic text fallback
# ==============================================================================

def observe_raw_spec_text(
    soup: BeautifulSoup,
) -> str:

    root = (
        soup.select_one(
            '[data-bind="html: techSpecs"]'
        )
        or
        soup.select_one(
            "#techspecs_section"
        )
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

    soup = BeautifulSoup(
        document.content,
        "html.parser",
    )

    format_a = observe_format_a(
        soup
    )

    format_b = observe_format_b(
        soup
    )

    raw_text = observe_raw_spec_text(
        soup
    )

    if format_a:

        detected_format = "FORMAT_A"

        specifications = format_a

    elif format_b:

        detected_format = "FORMAT_B"

        specifications = format_b

    else:

        detected_format = "UNKNOWN"

        specifications = []

    return {
        "source": "dell",
        "source_url": document.source_url,
        "document_key": document.document_key,

        "format": detected_format,

        "specifications": specifications,

        "raw_text": raw_text,
    }


# ==============================================================================
# Runtime
# ==============================================================================

def observe_listing() -> list[dict]:

    trace_pipeline(
        "DELL LISTING OBSERVATION",
    )

    print()

    print(
        "=" * 70
    )

    print(
        "DELL LISTING OBSERVATION"
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

    format_a_count = 0

    format_b_count = 0

    unknown_count = 0

    observation_count = 0

    # ==========================================================================
    # Observation Collection
    # ==========================================================================

    observations: list[dict] = []

    # ==========================================================================
    # Documents
    # ==========================================================================

    for document in documents:

        total += 1

        observation = observe_document(
            document
        )

        # ----------------------------------------------------------------------
        # Preserve Observation for next Runtime Stage
        # ----------------------------------------------------------------------

        observations.append(
            observation
        )

        detected_format = observation[
            "format"
        ]

        specifications = observation[
            "specifications"
        ]

        if detected_format == "FORMAT_A":

            format_a_count += 1

        elif detected_format == "FORMAT_B":

            format_b_count += 1

        else:

            unknown_count += 1

        if specifications:

            observation_count += 1

        print()

        print(
            "=" * 70
        )

        print(
            f"[{total}] "
            f"{document.document_key}"
        )

        print(
            f"FORMAT : {detected_format}"
        )

        print(
            f"SPECS  : {len(specifications)}"
        )

        print(
            f"URL    : {document.source_url}"
        )

        # ----------------------------------------------------------------------
        # First few items only
        # ----------------------------------------------------------------------

        for item in specifications[:5]:

            print(
                "  "
                f"{item}"
            )

        if len(specifications) > 5:

            print(
                f"  ... "
                f"+{len(specifications) - 5}"
            )

    # ==========================================================================
    # Result
    # ==========================================================================

    print()

    print(
        "=" * 70
    )

    print(
        "DELL LISTING OBSERVATION RESULT"
    )

    print(
        "=" * 70
    )

    print(
        f"PRODUCTS : {total}"
    )

    print(
        f"FORMAT_A : {format_a_count}"
    )

    print(
        f"FORMAT_B : {format_b_count}"
    )

    print(
        f"UNKNOWN  : {unknown_count}"
    )

    print(
        f"OBSERVED : {observation_count}"
    )

    print(
        f"RETURNED : {len(observations)}"
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

    return observe_listing()


if __name__ == "__main__":

    main()