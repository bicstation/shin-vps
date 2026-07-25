#!/usr/bin/env python3
"""
OZ GAMING Reality Fetch

カテゴリ一覧HTMLを取得し、
Realityを一切加工せず保存する。

Responsibility
--------------
- TSVを読む
- HTMLを取得する
- ページャーを確認する
- 全ページHTMLを保存する
- 成功・失敗を記録する

商品解析は行わない。

Reality First
Observation First
"""

from pathlib import Path
import sys
import csv
import requests

from bs4 import BeautifulSoup

# ==========================================================
# Django Root
# ==========================================================

ROOT_DIR = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT_DIR))

from imports.ozgaming.scripts.settings import (
    USER_AGENT,
    TIMEOUT,
)

# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

LIST_FILE = BASE_DIR / "scripts" / "list.tsv"

RAW_DIR = BASE_DIR / "output" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# ==========================================================
# Pager
# ==========================================================

def discover_total_pages(html: bytes) -> int:
    """
    ページャーのみ確認する。

    商品解析は行わない。
    """

    soup = BeautifulSoup(html, "html.parser")

    pager = soup.select("nav.pager a.pager-num")

    pages = []

    for a in pager:

        text = a.get_text(strip=True)

        if text.isdigit():
            pages.append(int(text))

    if not pages:
        return 1

    return max(pages)

# ==========================================================
# Fetch
# ==========================================================

def fetch():

    with open(LIST_FILE, encoding="utf-8") as f:
        rows = list(csv.DictReader(f, delimiter="\t"))

    print("=" * 60)
    print("OZ GAMING REALITY FETCH")
    print("=" * 60)
    print(f"Target   : {len(rows)} Categories")
    print(f"Timeout  : {TIMEOUT} sec")
    print("=" * 60)

    success = 0
    failed = 0

    with requests.Session() as session:

        session.headers.update({
            "User-Agent": USER_AGENT,
            "Accept": "text/html",
        })

        for index, row in enumerate(rows, start=1):

            category_id = row["category_id"]
            category_name = row["category_name"]
            base_url = row["url"]

            print()
            print("=" * 60)
            print(f"[{index}/{len(rows)}] {category_name}")
            print("=" * 60)

            try:

                #
                # Page1
                #

                response = session.get(
                    base_url,
                    timeout=TIMEOUT,
                )

                response.raise_for_status()

                total_pages = discover_total_pages(
                    response.content
                )

                print(f"Pages : {total_pages}")

                #
                # Fetch All Pages
                #

                for page in range(1, total_pages + 1):

                    if page == 1:
                        page_response = response
                        page_url = base_url
                    else:

                        page_url = f"{base_url}?page={page}"

                        page_response = session.get(
                            page_url,
                            timeout=TIMEOUT,
                        )

                        page_response.raise_for_status()

                    output_file = (
                        RAW_DIR /
                        f"{category_id}_p{page}.html"
                    )

                    #
                    # Realityは一切加工しない
                    #

                    output_file.write_bytes(
                        page_response.content
                    )

                    print(
                        f"  Page {page:>2} "
                        f"-> {output_file.name}"
                    )

                success += 1

            except Exception as e:

                failed += 1

                print(f"Category : {category_id}")
                print(f"URL      : {base_url}")
                print(f"ERROR    : {e}")

    print()
    print("=" * 60)
    print("COMPLETE")
    print("=" * 60)
    print(f"Success : {success}")
    print(f"Failed  : {failed}")
    print("=" * 60)

# ==========================================================
# Main
# ==========================================================

if __name__ == "__main__":
    fetch()