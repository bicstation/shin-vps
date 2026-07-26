# /home/maya/shin-dev/shin-vps/django/acquisition/sources/scraping/geekom/formatter.py

#!/usr/bin/env python3
"""
formatter.py

GEEKOM Formatter Runtime

Raw HTML
    ↓
Normalized HTML

Responsibilities

- HTML Parse
- Remove Script
- Remove Style
- Remove Comments
- Normalize Whitespace

Reality First
Observation First
"""

from __future__ import annotations

from bs4 import BeautifulSoup
from bs4 import Comment

from settings import PRODUCT_RAW_DIR, FORMATTED_DIR


def normalize(html: str) -> str:
    """
    Normalize HTML without changing semantic meaning.
    """

    soup = BeautifulSoup(html, "html.parser")

    #
    # Remove script/style
    #

    for tag in soup(["script", "style"]):
        tag.decompose()

    #
    # Remove HTML comments
    #

    for comment in soup.find_all(
        string=lambda text: isinstance(text, Comment)
    ):
        comment.extract()

    #
    # Normalize attributes
    #

    for tag in soup.find_all(True):

        attrs = {}

        for key, value in tag.attrs.items():

            if value in (None, "", [], {}):

                continue

            attrs[key] = value

        tag.attrs = attrs

    return str(soup)


def format_products():

    PRODUCT_RAW_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    FORMATTED_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    files = sorted(
        PRODUCT_RAW_DIR.glob("*.html")
    )

    print("=" * 60)
    print("🧹 GEEKOM FORMATTER")
    print("=" * 60)
    print(f"Target : {len(files)} HTML")
    print("=" * 60)

    success = 0

    for html_file in files:

        normalized = normalize(
            html_file.read_text(
                encoding="utf-8",
                errors="ignore",
            )
        )

        output = FORMATTED_DIR / html_file.name

        output.write_text(
            normalized,
            encoding="utf-8",
        )

        success += 1

        print(f"✓ {html_file.name}")

    print("=" * 60)
    print(f"SUCCESS : {success}")
    print("=" * 60)


def main():

    format_products()


if __name__ == "__main__":
    main()