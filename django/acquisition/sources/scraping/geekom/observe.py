#!/usr/bin/env python3
"""
observe.py

GEEKOM Observation Runtime

Acquire Runtime
        │
        ▼
Formatter Runtime (Memory)
        │
        ▼
Observation Runtime
        │
        ▼
ObservationDocument

Responsibilities

- Observe Reality
- Preserve Reality
- Produce ObservationDocument

NOT

- Parse Specifications
- Generate Meaning
- Classify Reality
- Infer
- Guess

Reality First
Observation First
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


# ==========================================================
# Observation
# ==========================================================

def observe(html: str) -> dict:

    trace_pipeline("Observation")

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

    #
    # Reality Snapshot
    #

    result = {

        #
        # Identity
        #

        "title": "",

        "url": "",

        "description": "",

        #
        # Media
        #

        "main_image": "",

        "images": [],

        #
        # Reality
        #

        "tables": [],

        "scripts": [],

    }

    #
    # Title
    #

    if soup.title:

        result["title"] = soup.title.get_text(
            strip=True,
        )

    #
    # Canonical URL
    #

    canonical = soup.find(
        "link",
        rel="canonical",
    )

    if canonical:

        result["url"] = canonical.get(
            "href",
            "",
        ).strip()

    #
    # Meta Description
    #

    meta = soup.find(
        "meta",
        attrs={
            "name": "description",
        },
    )

    if meta:

        result["description"] = meta.get(
            "content",
            "",
        )
    #
    # Images
    #

    images = []

    for img in soup.select(
        '.product-gallery__media[data-media-type="image"] img',
    ):

        src = (
            img.get("src")
            or img.get("data-src")
            or ""
        ).strip()

        if (
            not src
            or src.startswith("data:image")
        ):
            continue

        if src.startswith("//"):
            src = "https:" + src

        if src not in images:
            images.append(src)

    result["images"] = images

    if images:

        result["main_image"] = images[0]

    #
    # Tables
    #

    result["tables"] = [

        table.get_text(
            "\n",
            strip=True,
        )

        for table in soup.find_all(
            "table",
        )

    ]

    #
    # JSON-LD
    #

    for script in soup.find_all(
        "script",
        type="application/ld+json",
    ):

        if not script.string:
            continue

        #
        # Preserve Reality
        #

        result["scripts"].append(
            script.string,
        )

        #
        # URL Fallback
        #

        if result["url"]:
            continue

        try:

            data = json.loads(
                script.string,
            )

        except Exception:

            continue

        if isinstance(
            data,
            dict,
        ):

            if data.get(
                "url",
            ):

                result["url"] = data["url"]

                continue

            graph = data.get(
                "@graph",
            )

            if isinstance(
                graph,
                list,
            ):

                for node in graph:

                    if (
                        isinstance(
                            node,
                            dict,
                        )
                        and node.get(
                            "url",
                        )
                    ):

                        result["url"] = node["url"]

                        break

    #
    # Trace
    #

    trace(
        "Observation Result",
        {
            "title": result["title"],
            "url": result["url"],
            "description": bool(
                result["description"],
            ),
            "main_image": result["main_image"],
            "images": len(
                result["images"],
            ),
            "tables": len(
                result["tables"],
            ),
            "jsonld": len(
                result["scripts"],
            ),
        },
    )

    return result

# ==========================================================
# Runtime
# ==========================================================

def run() -> None:

    print("=" * 60)
    print("👀 GEEKOM OBSERVATION")
    print("=" * 60)

    trace_pipeline("Observation")

    documents = AcquisitionDocument.objects.filter(
        source_name="geekom",
        document_type="product",
    ).iterator()

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

        normalized = normalize(
            document.content,
        )

        #
        # Observation Runtime
        #

        observation = observe(
            normalized,
        )

        #
        # ObservationDocument
        #

        obj, _ = ObservationDocument.objects.update_or_create(
            source_name=document.source_name,
            document_type=document.document_type,
            document_key=document.document_key,
            defaults={
                "observation": observation,
            },
        )

        trace_model(
            "ObservationDocument",
            obj,
        )

        success += 1

    print("=" * 60)
    print(f"SUCCESS : {success}")
    print("=" * 60)


# ==========================================================
# Main
# ==========================================================

def main() -> None:

    run()


if __name__ == "__main__":

    main()