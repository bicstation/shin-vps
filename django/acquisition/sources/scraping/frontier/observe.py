#!/usr/bin/env python3
"""
==============================================================================
FRONTIER Observation Runtime

Acquire HTML
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
==============================================================================

Responsibilities

- Observe Reality
- Extract Evidence
- Produce ObservationDocument

Not Responsibilities

- Semantic Mapping
- Import Contract
- Database Integration
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

from .formatter import normalize


# ==============================================================================
# Observation Factory
# ==============================================================================

def create_observation() -> dict:

    """
    Create empty Observation Runtime object.
    """

    return {
        "title": "",
        "url": "",
        "description": "",
        "main_image": "",
        "images": [],
        "tables": [],
        "scripts": [],
    }


# ==============================================================================
# Title Observation
# ==============================================================================

def observe_title(
    soup: BeautifulSoup,
    observation: dict,
):

    """
    Observe HTML Title.
    """

    if soup.title:

        observation["title"] = soup.title.get_text(
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
    """

    canonical = soup.find(
        "link",
        rel="canonical",
    )

    if canonical:

        observation["url"] = canonical.get(
            "href",
            "",
        ).strip()
        
# ==============================================================================
# Description Observation
# ==============================================================================

def observe_description(
    soup: BeautifulSoup,
    observation: dict,
):

    """
    Observe Meta Description.
    """

    meta = soup.find(
        "meta",
        attrs={
            "name": "description",
        },
    )

    if meta:

        observation["description"] = meta.get(
            "content",
            "",
        ).strip()


# ==============================================================================
# Image Observation
# ==============================================================================

def observe_images(
    soup: BeautifulSoup,
    observation: dict,
):

    """
    Observe Product Images.
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

        if src.startswith("data:image"):
            continue

        if src.startswith("//"):
            src = "https:" + src

        if src not in images:
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
    """

    tables = []

    for table in soup.find_all("table"):

        tables.append(
            table.get_text(
                "\n",
                strip=True,
            )
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

    Store every JSON-LD script as Reality.
    If Canonical URL is missing, supplement it from JSON-LD.
    """

    for script in soup.find_all(
        "script",
        type="application/ld+json",
    ):

        if not script.string:
            continue

        observation["scripts"].append(
            script.string
        )

        #
        # URL already observed
        #

        if observation["url"]:
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

                observation["url"] = url

                continue

            #
            # @graph
            #

            graph = data.get("@graph")

            if isinstance(
                graph,
                list,
            ):

                for node in graph:

                    if not isinstance(
                        node,
                        dict,
                    ):
                        continue

                    url = node.get("url")

                    if url:

                        observation["url"] = url

                        break


# ==============================================================================
# Observation Runtime
# ==============================================================================

def observe(
    html: str,
):

    """
    Observe Reality from HTML.
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
            "title": observation["title"],
            "url": observation["url"],
            "description": bool(
                observation["description"]
            ),
            "main_image": observation["main_image"],
            "images": len(
                observation["images"]
            ),
            "tables": len(
                observation["tables"]
            ),
            "jsonld": len(
                observation["scripts"]
            ),
        },
    )

    return observation

# ==============================================================================
# Runtime
# ==============================================================================

def run():

    print("=" * 70)
    print("👀 FRONTIER OBSERVATION")
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
        .iterator()
    )

    success = 0

    for document in documents:

        trace(
            "Observation Document",
            {
                "key": document.document_key,
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
        # Save ObservationDocument
        #

        obj, _ = (
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

        trace_model(
            "ObservationDocument",
            obj,
        )

        success += 1

    print()
    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"SUCCESS : {success}")
    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main():

    run()


if __name__ == "__main__":
    main()
    