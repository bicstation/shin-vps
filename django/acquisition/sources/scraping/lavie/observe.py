#!/usr/bin/env python3
"""
==============================================================================
FRONTIER Observation Runtime

Acquire Runtime
        │
        ▼
Formatter Runtime
        │
        ▼
Observation Runtime
        │
        ▼
ObservationDocument

Reality First
Observation First

Overview

Observe Reality exactly as published.

This Runtime extracts observable evidence from HTML and stores it
without interpretation or semantic classification.

Responsibilities

- Observe Reality
- Extract Observable Evidence
- Produce ObservationDocument
- Preserve Reality

Not Responsibilities

- Semantic Classification
- Identity Resolution
- AI Processing
- Import Contract Generation
- Database Integration
==============================================================================

ObservationDocument

{
    "html_title": "...",
    "canonical_url": "...",
    "meta_description": "...",

    "main_image": "...",
    "images": [...],

    "tables": [
        {
            "text": "...",
            "html": "..."
        }
    ],

    "jsonld_scripts": [
        "{...}"
    ]
}
==============================================================================
"""

from __future__ import annotations

import json

from bs4 import BeautifulSoup

from api.models import (
    AcquisitionDocument,
    ObservationDocument,
)

from acquisition.common.trace.reality_trace import (
    trace,
    trace_model,
    trace_pipeline,
)

from .formatter_product import normalize


# ==============================================================================
# Observation Factory
# ==============================================================================

def create_observation() -> dict:
    """
    Create an empty ObservationDocument.

    Every field represents directly observable Reality.

    No semantic meaning should be generated here.
    """

    return {

        #
        # HTML Observation
        #

        "html_title": "",

        "canonical_url": "",

        "meta_description": "",

        #
        # Media Observation
        #

        "main_image": "",

        "images": [],

        #
        # Structure Observation
        #

        "tables": [],

        #
        # Structured Data Observation
        #

        "jsonld_scripts": [],

    }


# ==============================================================================
# HTML Title Observation
# ==============================================================================

def observe_title(
    soup: BeautifulSoup,
    observation: dict,
):
    """
    Observe HTML <title>.

    This is the raw document title published
    by the source website.
    """

    if not soup.title:
        return

    observation["html_title"] = soup.title.get_text(
        strip=True,
    )
# ==============================================================================
# Canonical URL Observation
# ==============================================================================

def observe_url(
    soup: BeautifulSoup,
    observation: dict,
):
    """
    Observe Canonical URL.

    The canonical URL is treated as the primary
    identity URL published by the source website.

    No inference is performed.
    """

    canonical = soup.find(
        "link",
        rel="canonical",
    )

    if not canonical:
        return

    observation["canonical_url"] = (
        canonical.get(
            "href",
            "",
        ).strip()
    )


# ==============================================================================
# Meta Description Observation
# ==============================================================================

def observe_description(
    soup: BeautifulSoup,
    observation: dict,
):
    """
    Observe HTML Meta Description.

    Only the published meta description
    is preserved.
    """

    meta = soup.find(
        "meta",
        attrs={
            "name": "description",
        },
    )

    if not meta:
        return

    observation["meta_description"] = (
        meta.get(
            "content",
            "",
        ).strip()
    )


# ==============================================================================
# Product Image Observation
# ==============================================================================

def observe_images(
    soup: BeautifulSoup,
    observation: dict,
):
    """
    Observe Product Images.

    Responsibilities

    - Collect published product images
    - Preserve published image order
    - Ignore inline data images

    No image classification is performed.
    """

    images = []

    for img in soup.select(
        '.product-gallery__media[data-media-type="image"] img'
    ):

        src = (
            img.get("src")
            or img.get("data-src")
            or ""
        ).strip()

        if not src:
            continue

        #
        # Ignore inline images
        #

        if src.startswith("data:image"):
            continue

        #
        # Normalize protocol-relative URL
        #

        if src.startswith("//"):
            src = "https:" + src

        #
        # Preserve unique images only
        #

        if src in images:
            continue

        images.append(src)

    observation["images"] = images

    if images:
        observation["main_image"] = images[0]

# ==============================================================================
# Table Observation
# ==============================================================================

def observe_tables(
    soup: BeautifulSoup,
    observation: dict,
):
    """
    Observe HTML Tables.

    Every published HTML table is preserved as Reality.

    Both rendered text and original HTML are stored.

    This enables future AI Runtime to analyze either
    human-readable content or original document structure.
    """

    tables = []

    for table in soup.find_all("table"):

        tables.append(

            {

                #
                # Human-readable text
                #

                "text": table.get_text(
                    "\n",
                    strip=True,
                ),

                #
                # Original HTML
                #

                "html": str(table),

            }

        )

    observation["tables"] = tables


# ==============================================================================
# JSON-LD Observation
# ==============================================================================

def observe_jsonld(
    soup: BeautifulSoup,
    observation: dict,
):
    """
    Observe JSON-LD.

    Responsibilities

    - Preserve every JSON-LD block
    - Supplement Canonical URL when absent

    JSON-LD itself is treated as published Reality.

    No semantic interpretation is performed.
    """

    for script in soup.find_all(
        "script",
        type="application/ld+json",
    ):

        if not script.string:
            continue

        #
        # Preserve raw JSON-LD
        #

        observation["jsonld_scripts"].append(
            script.string
        )

        #
        # Canonical URL already observed
        #

        if observation["canonical_url"]:
            continue

        try:

            data = json.loads(
                script.string
            )

        except Exception:

            continue

        #
        # Simple JSON-LD
        #

        if isinstance(
            data,
            dict,
        ):

            url = data.get("url")

            if url:

                observation["canonical_url"] = url

                continue

            #
            # JSON-LD Graph
            #

            graph = data.get("@graph")

            if not isinstance(
                graph,
                list,
            ):
                continue

            for node in graph:

                if not isinstance(
                    node,
                    dict,
                ):
                    continue

                url = node.get("url")

                if url:

                    observation["canonical_url"] = url

                    break

# ==============================================================================
# Observation Runtime
# ==============================================================================

def observe(
    html: str,
) -> dict:
    """
    Observe Reality from normalized HTML.

    Observation Runtime performs no semantic analysis.

    It only preserves observable evidence.
    """

    trace_pipeline(
        "Observation",
    )

    trace(
        "Observation Input",
        {
            "html_length": len(html),
        },
    )

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    observation = create_observation()

    #
    # Observe Reality
    #

    observe_title(
        soup,
        observation,
    )

    observe_url(
        soup,
        observation,
    )

    observe_description(
        soup,
        observation,
    )

    observe_images(
        soup,
        observation,
    )

    observe_tables(
        soup,
        observation,
    )

    observe_jsonld(
        soup,
        observation,
    )

    trace(
        "Observation Result",
        {

            "html_title":
                observation["html_title"],

            "canonical_url":
                observation["canonical_url"],

            "meta_description":
                bool(
                    observation["meta_description"]
                ),

            "main_image":
                observation["main_image"],

            "images":
                len(
                    observation["images"]
                ),

            "tables":
                len(
                    observation["tables"]
                ),

            "jsonld_scripts":
                len(
                    observation["jsonld_scripts"]
                ),

        },
    )

    return observation


# ==============================================================================
# ObservationDocument Persistence
# ==============================================================================

def save_observation_document(
    *,
    document: AcquisitionDocument,
    observation: dict,
):
    """
    Persist ObservationDocument.

    ObservationDocument is the canonical
    Reality representation for downstream runtimes.
    """

    obj, created = (
        ObservationDocument.objects
        .update_or_create(

            source_name=document.source_name,

            document_type=document.document_type,

            document_key=document.document_key,

            defaults={

                "observation": observation,

            },

        )
    )

    return obj, created


# ==============================================================================
# Runtime
# ==============================================================================

def run():
    """
    Execute Observation Runtime.
    """

    print("=" * 70)
    print("👀 FRONTIER OBSERVATION RUNTIME")
    print("=" * 70)

    trace_pipeline(
        "Observation",
    )

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_name="frontier",

            document_type="product",

        )

        .order_by(
            "document_key",
        )

        .iterator()

    )

    success = 0

    for document in documents:

        trace(
            "Observation Document",
            {
                "document_key":
                    document.document_key,
            },
        )

        #
        # Formatter Runtime
        #

        html = normalize(
            document.content,
        )

        #
        # Observation Runtime
        #

        observation = observe(
            html,
        )

        #
        # Persist ObservationDocument
        #

        obj, created = save_observation_document(

            document=document,

            observation=observation,

        )

        trace_model(
            "ObservationDocument",
            obj,
        )

        success += 1

    print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)

    print(
        f"SUCCESS : {success}"
    )

    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main():
    """
    Runtime Entry Point.
    """

    run()


if __name__ == "__main__":
    main()