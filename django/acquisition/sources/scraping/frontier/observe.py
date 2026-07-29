#!/usr/bin/env python3
"""
==============================================================================
observe.py

FRONTIER Observation Runtime

AcquisitionDocument
        │
        ▼
Formatter Runtime (Memory)
        │
        ▼
Observation
        │
        ▼
ObservationDocument

Reality First
Observation First
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


def observe(html: str):

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

    result = {
        "title": "",
        "url": "",
        "description": "",
        "main_image": "",
        "images": [],
        "tables": [],
        "scripts": [],
    }

    #
    # Title
    #

    if soup.title:
        result["title"] = soup.title.get_text(strip=True)

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
    # Description
    #

    meta = soup.find(
        "meta",
        attrs={"name": "description"},
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
        '.product-gallery__media[data-media-type="image"] img'
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
        table.get_text("\n", strip=True)
        for table in soup.find_all("table")
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

        result["scripts"].append(
            script.string
        )

        if result["url"]:
            continue

        try:

            data = json.loads(script.string)

        except Exception:
            continue

        if isinstance(data, dict):

            if data.get("url"):

                result["url"] = data["url"]
                continue

            graph = data.get("@graph")

            if isinstance(graph, list):

                for node in graph:

                    if (
                        isinstance(node, dict)
                        and node.get("url")
                    ):

                        result["url"] = node["url"]
                        break

    trace(
        "Observation Result",
        {
            "title": result["title"],
            "url": result["url"],
            "description": bool(result["description"]),
            "main_image": result["main_image"],
            "images": len(result["images"]),
            "tables": len(result["tables"]),
            "jsonld": len(result["scripts"]),
        },
    )

    return result


def run():

    print("=" * 60)
    print("👀 FRONTIER OBSERVATION")
    print("=" * 60)

    trace_pipeline("Observation")

    documents = AcquisitionDocument.objects.filter(
        source_name="frontier",
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

        normalized = normalize(
            document.content,
        )

        observation = observe(
            normalized,
        )

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


def main():

    run()


if __name__ == "__main__":
    main()