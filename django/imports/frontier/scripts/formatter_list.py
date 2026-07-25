#!/usr/bin/env python3
"""
formatter_list.py

Mission:
    Build FRONTIER Product Payload

Reality:
    products.tsv
    series.tsv

Output:
    products.json
"""

from pathlib import Path
import csv
import json


# --------------------------------------------------------
# Paths
# --------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

OUTPUT_DIR = BASE_DIR / "output"

PRODUCTS_FILE = OUTPUT_DIR / "products.tsv"
SERIES_FILE = OUTPUT_DIR / "series.tsv"

PAYLOAD_DIR = OUTPUT_DIR / "payload"
PAYLOAD_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = PAYLOAD_DIR / "products.json"


# --------------------------------------------------------
# Helpers
# --------------------------------------------------------

def load_tsv(path, key):

    with open(path, encoding="utf-8") as f:
        rows = csv.DictReader(f, delimiter="\t")
        return {
            row[key]: row
            for row in rows
        }


def build_description(product):

    fields = [
        "cpu",
        "gpu",
        "memory",
        "storage",
        "os",
    ]

    lines = []

    for field in fields:

        value = product.get(field, "").strip()

        if value:
            lines.append(f"{field}: {value}")

    return "\n".join(lines)


# --------------------------------------------------------
# Main
# --------------------------------------------------------

def main():

    print("=" * 60)
    print("FRONTIER FORMATTER")
    print("=" * 60)

    series_map = load_tsv(
        SERIES_FILE,
        "model_slug",
    )

    results = []

    with open(PRODUCTS_FILE, encoding="utf-8") as f:

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

    OUTPUT_FILE.write_text(

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
    print(f"Saved    : {OUTPUT_FILE}")
    print("DONE")
    print("=" * 60)


if __name__ == "__main__":
    main()