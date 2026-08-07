# /home/maya/shin-vps/django/acquisition/sources/scraping/frontier/formatter_list.py

#!/usr/bin/env python3
"""
FRONTIER Product Formatter

Observation
    product_list.tsv
    series_list.tsv

↓

Import Contract
    products.json
"""

from __future__ import annotations

import csv
import json

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    PRODUCT_LIST_TSV,
    SERIES_LIST_TSV,
    PRODUCTS_JSON,
)


# ==========================================================
# Helpers
# ==========================================================

def load_tsv(path, key):

    with path.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        return {
            row[key]: row
            for row in csv.DictReader(
                f,
                delimiter="\t",
            )
        }


def build_description(product):

    fields = (
        "cpu",
        "gpu",
        "memory",
        "storage",
        "os",
    )

    lines = []

    for field in fields:

        value = product.get(field, "").strip()

        if value:
            lines.append(f"{field}: {value}")

    return "\n".join(lines)


# ==========================================================
# Formatter
# ==========================================================

def format_products():

    trace_pipeline("FORMATTER")

    print("=" * 60)
    print("FRONTIER PRODUCT FORMATTER")
    print("=" * 60)

    series_map = load_tsv(
        SERIES_LIST_TSV,
        "model_slug",
    )

    results = []

    with PRODUCT_LIST_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        reader = csv.DictReader(
            f,
            delimiter="\t",
        )

        for row in reader:

            series = series_map.get(
                row["model_slug"],
                {},
            )

            payload = {

                "maker": "FRONTIER",

                "brand":
                    series.get("brand", ""),

                "category":
                    series.get("category", ""),

                "series":
                    series.get("series", ""),

                "model_slug":
                    row.get("model_slug", ""),

                "product_code":
                    row.get("product_code", ""),

                "product_name":
                    row.get("product_name", ""),

                "price":
                    row.get("price", ""),

                "product_url":
                    row.get("product_url", ""),

                "image_url":
                    row.get("image_url", ""),

                "observation": {

                    "raw_title":
                        row.get("product_name", ""),

                    "feature":
                        row.get("feature", ""),

                    "description":
                        build_description(row),

                    "specifications": {

                        "cpu":
                            row.get("cpu", ""),

                        "gpu":
                            row.get("gpu", ""),

                        "memory":
                            row.get("memory", ""),

                        "storage":
                            row.get("storage", ""),

                        "os":
                            row.get("os", ""),

                    },

                },

            }

            results.append(payload)

            print(
                f'{row["product_code"]:20} '
                f'-> {payload["series"]}'
            )

    PRODUCTS_JSON.write_text(

        json.dumps(
            results,
            ensure_ascii=False,
            indent=2,
        ),

        encoding="utf-8",

    )

    print()
    print("=" * 60)
    print(f"Products : {len(results)}")
    print(f"Saved    : {PRODUCTS_JSON}")
    print("DONE")
    print("=" * 60)


def main():
    format_products()


if __name__ == "__main__":
    main()