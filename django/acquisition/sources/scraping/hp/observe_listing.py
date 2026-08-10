#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/hp/observe_listing.py

SHIN CORE LINX

HP Manufacturer Reality Observation Runtime

Reality First
Observation First
AI Analysis Material Acquisition

Responsibilities

- Read acquired HP product HTML
- Extract published manufacturer information
- Preserve manufacturer terminology
- Collect structured HTML information
- Preserve raw published text
- Return Observation Reality

NOT

- Semantic classification
- CPU/GPU mapping
- Memory normalization
- Storage normalization
- AI analysis
- Product building
- Attribute mapping
- Semantic processing
- PCProduct persistence


==============================================================================

Reality

AcquisitionDocument
        │
        ▼
    HP HTML
        │
        ├── title
        ├── description
        ├── headings
        ├── paragraphs
        ├── lists
        ├── tables
        ├── images
        └── raw text
        │
        ▼
   Observation Reality
        │
        ▼
   Observation Store
        │
        ▼
   PCProduct.observation_runtime


IMPORTANT

This is a verification Observer.

The Runtime intentionally collects broad published Reality.

It does NOT attempt to determine:

    CPU
    GPU
    RAM
    Storage
    Display

as semantic fields.

Those meanings belong to later AI / semantic processing.

The purpose here is:

    "Can the acquired HP HTML provide sufficient
     Reality for downstream AI analysis?"
==============================================================================
"""

from __future__ import annotations


from bs4 import (
    BeautifulSoup,
)


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
    """
    Normalize whitespace only.

    No semantic transformation is performed.
    """

    if not value:

        return ""

    return " ".join(
        str(value).split()
    ).strip()


# ==============================================================================
# Meta Description
# ==============================================================================

def observe_description(
    soup: BeautifulSoup,
) -> str:
    """
    Extract published HTML meta description.
    """

    element = soup.select_one(
        'meta[name="description"]'
    )

    if not element:

        return ""

    return clean_text(
        element.get(
            "content",
            "",
        )
    )


# ==============================================================================
# Title
# ==============================================================================

def observe_title(
    soup: BeautifulSoup,
) -> str:
    """
    Extract published HTML title.
    """

    if not soup.title:

        return ""

    return clean_text(
        soup.title.get_text(
            " ",
            strip=True,
        )
    )


# ==============================================================================
# Headings
# ==============================================================================

def observe_headings(
    soup: BeautifulSoup,
) -> list[dict]:
    """
    Extract published headings.

    Preserves the original HTML heading level.
    """

    results: list[dict] = []

    for element in soup.select(
        "h1, h2, h3, h4, h5, h6"
    ):

        text = clean_text(
            element.get_text(
                " ",
                strip=True,
            )
        )

        if not text:

            continue

        results.append(
            {
                "tag": element.name,
                "text": text,
            }
        )

    return results


# ==============================================================================
# Paragraphs
# ==============================================================================

def observe_paragraphs(
    soup: BeautifulSoup,
) -> list[str]:
    """
    Extract published paragraph text.
    """

    results: list[str] = []

    for element in soup.select(
        "p"
    ):

        text = clean_text(
            element.get_text(
                " ",
                strip=True,
            )
        )

        if not text:

            continue

        results.append(
            text
        )

    return results


# ==============================================================================
# Lists
# ==============================================================================

def observe_lists(
    soup: BeautifulSoup,
) -> list[str]:
    """
    Extract published list-item text.

    Both ordered and unordered lists are preserved.
    """

    results: list[str] = []

    for element in soup.select(
        "ul li, ol li"
    ):

        text = clean_text(
            element.get_text(
                " ",
                strip=True,
            )
        )

        if not text:

            continue

        results.append(
            text
        )

    return results


# ==============================================================================
# Tables
# ==============================================================================

def observe_tables(
    soup: BeautifulSoup,
) -> list[dict]:
    """
    Extract HTML table Reality.

    No semantic interpretation is performed.

    Each row preserves the published cell order.
    """

    results: list[dict] = []

    for table_index, table in enumerate(
        soup.select("table"),
        start=1,
    ):

        rows: list[list[str]] = []

        for row in table.select(
            "tr"
        ):

            cells = []

            for cell in row.select(
                "th, td"
            ):

                text = clean_text(
                    cell.get_text(
                        " ",
                        strip=True,
                    )
                )

                cells.append(
                    text
                )

            if cells:

                rows.append(
                    cells
                )

        if rows:

            results.append(
                {
                    "table_index": table_index,
                    "rows": rows,
                }
            )

    return results


# ==============================================================================
# Images
# ==============================================================================

def observe_images(
    soup: BeautifulSoup,
) -> list[dict]:
    """
    Extract published image Reality.

    Preserves:

    - src
    - data-src
    - alt
    """

    results: list[dict] = []

    for element in soup.select(
        "img"
    ):

        src = clean_text(
            element.get(
                "src",
                "",
            )
        )

        data_src = clean_text(
            element.get(
                "data-src",
                "",
            )
        )

        alt = clean_text(
            element.get(
                "alt",
                "",
            )
        )

        if not src and not data_src and not alt:

            continue

        results.append(
            {
                "src": src,
                "data_src": data_src,
                "alt": alt,
            }
        )

    return results


# ==============================================================================
# Raw Text
# ==============================================================================

def observe_raw_text(
    soup: BeautifulSoup,
) -> str:
    """
    Extract broad published page text.

    This is intentionally preserved as a large
    Reality source for downstream AI analysis.
    """

    return clean_text(
        soup.get_text(
            " ",
            strip=True,
        )
    )


# ==============================================================================
# HTML Statistics
# ==============================================================================

def observe_statistics(
    soup: BeautifulSoup,
) -> dict:
    """
    Collect HTML observation statistics.

    Statistics have no semantic meaning.

    They are used only to evaluate whether
    sufficient Reality was acquired.
    """

    return {
        "html_bytes": 0,
        "headings": len(
            soup.select(
                "h1, h2, h3, h4, h5, h6"
            )
        ),
        "paragraphs": len(
            soup.select(
                "p"
            )
        ),
        "list_items": len(
            soup.select(
                "ul li, ol li"
            )
        ),
        "tables": len(
            soup.select(
                "table"
            )
        ),
        "images": len(
            soup.select(
                "img"
            )
        ),
    }


# ==============================================================================
# One Document
# ==============================================================================

def observe_document(
    document: AcquisitionDocument,
) -> dict:
    """
    Observe one HP AcquisitionDocument.

    No semantic interpretation is performed.
    """

    content = (
        document.content
        or ""
    )

    soup = BeautifulSoup(
        content,
        "html.parser",
    )

    title = observe_title(
        soup
    )

    description = observe_description(
        soup
    )

    headings = observe_headings(
        soup
    )

    paragraphs = observe_paragraphs(
        soup
    )

    lists = observe_lists(
        soup
    )

    tables = observe_tables(
        soup
    )

    images = observe_images(
        soup
    )

    raw_text = observe_raw_text(
        soup
    )

    statistics = observe_statistics(
        soup
    )

    statistics[
        "html_bytes"
    ] = len(
        content.encode(
            "utf-8",
            errors="ignore",
        )
    )

    return {

        # ----------------------------------------------------------------------
        # Identity Reality
        # ----------------------------------------------------------------------

        "source": "hp",

        "source_url":
            document.source_url,

        "document_key":
            document.document_key,

        # ----------------------------------------------------------------------
        # Published Page Reality
        # ----------------------------------------------------------------------

        "title":
            title,

        "description":
            description,

        "headings":
            headings,

        "paragraphs":
            paragraphs,

        "lists":
            lists,

        "tables":
            tables,

        "images":
            images,

        # ----------------------------------------------------------------------
        # Broad Reality
        # ----------------------------------------------------------------------

        "raw_text":
            raw_text,

        # ----------------------------------------------------------------------
        # Observation Statistics
        # ----------------------------------------------------------------------

        "statistics":
            statistics,
    }


# ==============================================================================
# Runtime
# ==============================================================================

def observe_listing() -> list[dict]:
    """
    Execute HP Listing Observation Runtime.

    Runtime:

        AcquisitionDocument
                ↓
             HP HTML
                ↓
          BeautifulSoup
                ↓
        Published Reality
                ↓
           Observation
    """

    trace_pipeline(
        "HP LISTING OBSERVATION",
    )

    print()

    print(
        "=" * 70
    )

    print(
        "HP LISTING OBSERVATION"
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

    observed = 0

    empty = 0

    observations: list[dict] = []

    # ==========================================================================
    # Documents
    # ==========================================================================

    for document in documents:

        total += 1

        observation = observe_document(
            document
        )

        observations.append(
            observation
        )

        statistics = observation[
            "statistics"
        ]

        has_reality = bool(
            observation["title"]
            or observation["description"]
            or observation["headings"]
            or observation["paragraphs"]
            or observation["lists"]
            or observation["tables"]
            or observation["images"]
            or observation["raw_text"]
        )

        if has_reality:

            observed += 1

        else:

            empty += 1

        # ----------------------------------------------------------------------
        # Runtime Output
        # ----------------------------------------------------------------------

        print()

        print(
            "=" * 70
        )

        print(
            f"[{total}] "
            f"{document.document_key}"
        )

        print(
            f"URL        : "
            f"{document.source_url}"
        )

        print(
            f"HTML       : "
            f"{statistics['html_bytes']:,} bytes"
        )

        print(
            f"TITLE      : "
            f"{observation['title']}"
        )

        print(
            f"DESCRIPTION: "
            f"{len(observation['description'])}"
        )

        print(
            f"HEADINGS   : "
            f"{len(observation['headings'])}"
        )

        print(
            f"PARAGRAPHS : "
            f"{len(observation['paragraphs'])}"
        )

        print(
            f"LIST ITEMS : "
            f"{len(observation['lists'])}"
        )

        print(
            f"TABLES     : "
            f"{len(observation['tables'])}"
        )

        print(
            f"IMAGES     : "
            f"{len(observation['images'])}"
        )

        print(
            f"RAW TEXT   : "
            f"{len(observation['raw_text']):,}"
        )

        print(
            f"REALITY    : "
            f"{'AVAILABLE' if has_reality else 'EMPTY'}"
        )

        # ----------------------------------------------------------------------
        # Heading Preview
        # ----------------------------------------------------------------------

        for heading in observation[
            "headings"
        ][:5]:

            print(
                "  "
                f"{heading['tag']}: "
                f"{heading['text']}"
            )

        if len(
            observation["headings"]
        ) > 5:

            print(
                "  ... "
                f"+{len(observation['headings']) - 5}"
            )

    # ==========================================================================
    # Result
    # ==========================================================================

    print()

    print(
        "=" * 70
    )

    print(
        "HP LISTING OBSERVATION RESULT"
    )

    print(
        "=" * 70
    )

    print(
        f"PRODUCTS : {total}"
    )

    print(
        f"OBSERVED : {observed}"
    )

    print(
        f"EMPTY    : {empty}"
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


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()