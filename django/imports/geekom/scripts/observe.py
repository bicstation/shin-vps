#!/usr/bin/env python3
"""
observe.py

GEEKOM Product Observation Runtime

保存済み Product HTML を解析し、
Observation(JSON) を生成する。

Fetchしない
Importしない
AIを呼ばない

Reality First
"""

from pathlib import Path
import json

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent

RAW_DIR = ROOT / "output" / "raw" / "products"
OBSERVE_DIR = ROOT / "output" / "observation"

OBSERVE_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


def observe(html: str):

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
    # Product Images
    #
    images = []

    gallery_images = soup.select(
        '.product-gallery__media[data-media-type="image"] img'
    )

    for img in gallery_images:

        src = (
            img.get("src")
            or img.get("data-src")
            or ""
        ).strip()

        if not src:
            continue

        #
        # Ignore Base64
        #
        if src.startswith("data:image"):
            continue

        #
        # protocol-relative URL
        #
        if src.startswith("//"):
            src = "https:" + src

        #
        # Remove duplicates
        #
        if src not in images:
            images.append(src)

    result["images"] = images

    if images:
        result["main_image"] = images[0]

    #
    # Tables
    #
    for table in soup.find_all("table"):

        result["tables"].append(
            table.get_text(
                "\n",
                strip=True,
            )
        )

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

        #
        # URL already found
        #
        if result["url"]:
            continue

        try:
            data = json.loads(
                script.string
            )
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
    print("GEEKOM OBSERVATION")
    print("=" * 60)

    files = sorted(
        RAW_DIR.glob("*.html")
    )

    print(f"Target : {len(files)}")
    print("-" * 60)

    for html_file in files:

        html = html_file.read_text(
            encoding="utf-8",
            errors="ignore",
        )

        observation = observe(html)

        output = (
            OBSERVE_DIR
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
    print(f"Saved : {OBSERVE_DIR}")
    print("=" * 60)
    print("COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()