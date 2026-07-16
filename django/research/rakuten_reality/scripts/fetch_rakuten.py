#!/usr/bin/env python3
"""
ARRT-002
Rakuten Reality Research Team

Mission
-------
Fetch product data from Rakuten Ichiba Search API
and save the RAW JSON response.

Supported Search
----------------
--keyword
--shop
--item
--genre

Examples
--------
python fetch_rakuten.py --keyword Lenovo

python fetch_rakuten.py \
    --shop lenovopc

python fetch_rakuten.py \
    --keyword ThinkPad \
    --shop lenovopc

python fetch_rakuten.py \
    --item lenovopc:10006064

python fetch_rakuten.py \
    --genre 100026
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

ROOT_DIR = Path(__file__).resolve().parent.parent

OUTPUT_DIR = ROOT_DIR / "output" / "raw"

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

load_dotenv(ROOT_DIR / ".env")

# ---------------------------------------------------------
# Environment
# ---------------------------------------------------------

APPLICATION_ID = os.getenv(
    "RAKUTEN_APPLICATION_ID"
)

ACCESS_KEY = os.getenv(
    "RAKUTEN_ACCESS_KEY"
)

BASE_URL = os.getenv(
    "RAKUTEN_BASE_URL",
    "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701",
)

# ---------------------------------------------------------
# Validation
# ---------------------------------------------------------

if not APPLICATION_ID:
    print("Missing RAKUTEN_APPLICATION_ID")
    sys.exit(1)

if not ACCESS_KEY:
    print("Missing RAKUTEN_ACCESS_KEY")
    sys.exit(1)

# ---------------------------------------------------------
# Command Line
# ---------------------------------------------------------

keyword = None
shop_code = None
item_code = None
genre_id = None

args = sys.argv[1:]

i = 0

while i < len(args):

    arg = args[i]

    if arg == "--keyword":

        keyword = args[i + 1]

        i += 2
        continue

    if arg == "--shop":

        shop_code = args[i + 1]

        i += 2
        continue

    if arg == "--item":

        item_code = args[i + 1]

        i += 2
        continue

    if arg == "--genre":

        genre_id = args[i + 1]

        i += 2
        continue

    print("Unknown option :", arg)
    sys.exit(1)

# ---------------------------------------------------------
# Search Validation
# ---------------------------------------------------------

if not any([
    keyword,
    shop_code,
    item_code,
    genre_id,
]):

    print()
    print("One search condition is required.")
    print()

    print("Available options")
    print("-----------------")
    print("--keyword")
    print("--shop")
    print("--item")
    print("--genre")
    print()

    sys.exit(1)

# ---------------------------------------------------------
# Request
# ---------------------------------------------------------

headers = {
    "User-Agent": "SHIN CORE LINX Research",
}

params = {
    "applicationId": APPLICATION_ID,
    "accessKey": ACCESS_KEY,
    "format": "json",
}

if keyword:
    params["keyword"] = keyword

if shop_code:
    params["shopCode"] = shop_code

if item_code:
    params["itemCode"] = item_code

if genre_id:
    params["genreId"] = genre_id

# ---------------------------------------------------------
# Request Information
# ---------------------------------------------------------

print("=" * 60)
print("Rakuten Reality Research Team")
print("ARRT-002")
print("=" * 60)
print()

if keyword:
    print("Keyword  :", keyword)

if shop_code:
    print("ShopCode :", shop_code)

if item_code:
    print("ItemCode :", item_code)

if genre_id:
    print("GenreId  :", genre_id)

print()

# ---------------------------------------------------------
# Execute Request
# ---------------------------------------------------------

response = requests.get(
    BASE_URL,
    headers=headers,
    params=params,
    timeout=30,
)

# ---------------------------------------------------------
# Debug
# ---------------------------------------------------------

print("Request URL")
print(response.request.url)
print()

print("Status :", response.status_code)
print()

if response.status_code != 200:

    print("Response")
    print(response.text)

    sys.exit(1)

data = response.json()

print("Response : OK")
print()

# ---------------------------------------------------------
# Save RAW JSON
# ---------------------------------------------------------

if item_code:

    filename = (
        item_code
        .replace(":", "_")
        .replace("/", "_")
    )

elif shop_code:

    filename = shop_code

elif keyword:

    filename = (
        keyword.lower()
        .replace(" ", "_")
        .replace("/", "_")
    )

elif genre_id:

    filename = f"genre_{genre_id}"

else:

    filename = "result"

filename += ".json"

output_file = OUTPUT_DIR / filename

with output_file.open(
    "w",
    encoding="utf-8",
) as fp:

    json.dump(
        data,
        fp,
        ensure_ascii=False,
        indent=2,
    )

print("Saved")
print(output_file)
print()

# ---------------------------------------------------------
# Summary
# ---------------------------------------------------------

count = data.get("count", 0)

page = data.get("page", 1)

hits = data.get("hits", 0)

page_count = data.get("pageCount", 0)

items = data.get("Items", [])

print("=" * 60)
print("Summary")
print("=" * 60)

print("Total Count :", count)
print("Page        :", page)
print("Hits        :", hits)
print("Page Count  :", page_count)
print("Returned    :", len(items))

print()

# ---------------------------------------------------------
# No Result
# ---------------------------------------------------------

if not items:

    print("No Items Found")
    sys.exit(0)

# ---------------------------------------------------------
# Product List
# ---------------------------------------------------------

print("=" * 60)
print("Products")
print("=" * 60)

for index, wrapper in enumerate(items, start=1):

    item = wrapper.get("Item", {})

    print()

    print(f"[{index}]")

    print(
        "Name       :",
        item.get("itemName", ""),
    )

    print(
        "Price      :",
        item.get("itemPrice", ""),
    )

    print(
        "Shop       :",
        item.get("shopName", ""),
    )

    print(
        "Shop Code  :",
        item.get("shopCode", ""),
    )

    print(
        "Item Code  :",
        item.get("itemCode", ""),
    )

    print(
        "Review Avg :",
        item.get("reviewAverage", ""),
    )

    print(
        "Review Cnt :",
        item.get("reviewCount", ""),
    )

    print(
        "URL        :",
        item.get("itemUrl", ""),
    )

print()

print("=" * 60)
print("Completed")
print("=" * 60)

# ---------------------------------------------------------
# Usage
# ---------------------------------------------------------
#
# Keyword Search
#
# python fetch_rakuten.py \
#     --keyword Lenovo
#
# Official Shop Search
#
# python fetch_rakuten.py \
#     --shop lenovopc
#
# Shop + Keyword
#
# python fetch_rakuten.py \
#     --shop lenovopc \
#     --keyword ThinkPad
#
# Item Search
#
# python fetch_rakuten.py \
#     --item lenovopc:10006064
#
# Genre Search
#
# python fetch_rakuten.py \
#     --genre 100026
#
# ---------------------------------------------------------
#
# Future Options
#
# --page 1
# --hits 30
# --sort +itemPrice
# --sort -itemPrice
# --min-price
# --max-price
# --availability
#
# ---------------------------------------------------------