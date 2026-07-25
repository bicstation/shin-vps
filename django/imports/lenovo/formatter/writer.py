# /home/maya/shin-vps/django/imports/lenovo/formatter/writer.py
"""
Lenovo Payload Writer

Product一覧をJSONへ保存する。
"""

import json
from pathlib import Path
from typing import Dict, List


def write(
    products: List[Dict],
    output_file: Path,
) -> None:
    """
    Product一覧をJSONへ保存する。
    """

    output_file.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_file.write_text(
        json.dumps(
            products,
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


if __name__ == "__main__":

    BASE_DIR = Path(__file__).resolve().parent.parent

    OUTPUT_FILE = (
        BASE_DIR
        / "output"
        / "payload"
        / "products.json"
    )

    sample_products = [
        {
            "maker": "LENOVO",
            "brand": "ThinkPad",
            "series": "T Series",
            "product_name": "ThinkPad T14s Gen 7",
            "specs": {
                "CPU": "Snapdragon X2 Plus",
                "Memory": "16GB",
            },
        }
    ]

    write(
        sample_products,
        OUTPUT_FILE,
    )

    print("=" * 60)
    print("LENOVO PAYLOAD WRITER")
    print("=" * 60)
    print(f"Saved : {OUTPUT_FILE}")
    print("=" * 60)
    print("Writer OK")
    print("=" * 60)