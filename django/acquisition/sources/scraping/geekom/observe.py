#!/usr/bin/env python3
"""
observe.py

GEEKOM Observation Runtime

Normalized HTML
    ↓
Observation JSON

Reality First
Observation First
"""

from __future__ import annotations

import json

from bs4 import BeautifulSoup

from settings import (
    FORMATTED_DIR,
    OBSERVATION_DIR,
)

def observe(html: str):

    soup = BeautifulSoup(html, "html.parser")

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

    return result


def main():

    print("=" * 60)
    print("👀 GEEKOM OBSERVATION")
    print("=" * 60)

    files = sorted(
        FORMATTED_DIR.glob("*.html")
    )
    print(f"Target : {len(files)}")
    print("-" * 60)

    for html_file in files:

        observation = observe(

            html_file.read_text(
                encoding="utf-8",
                errors="ignore",
            )

        )

        output = (
            OBSERVATION_DIR
            / f"{html_file.stem}.json"
        )

        output.write_text(
            json.dumps(
                observation,
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )

        print(f"✓ {html_file.stem}")

    print("-" * 60)
    print(f"Saved : {OBSERVATION_DIR}")
    print("=" * 60)
    print("COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()