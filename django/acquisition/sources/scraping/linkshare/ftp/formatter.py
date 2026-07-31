# /home/maya/shin-dev/shin-vps/django/acquisition/sources/scraping/linkshare/ftp/formatter.py
# ============================================================================
# SHIN CORE LINX
# LinkShare FTP Formatter Runtime
# ============================================================================

import argparse
import csv
from pathlib import Path

FIXED_DELIMITER = "|"

EXPECTED_COLUMNS_COUNT = 38

FIELD_MAPPING = {
    "C1": {"DB_FIELD": "link_id", "TYPE": "str"},
    "C2": {"DB_FIELD": "manufacturer_name_fallback", "TYPE": "str"},
    "C3": {"DB_FIELD": "sku", "TYPE": "str"},
    "C4": {"DB_FIELD": "product_name_orig", "TYPE": "str"},
    "C5": {"DB_FIELD": "primary_category", "TYPE": "str"},
    "C6": {"DB_FIELD": "buy_url", "TYPE": "str"},
    "C7": {"DB_FIELD": "image_url", "TYPE": "str"},
    "C8": {"DB_FIELD": "product_url", "TYPE": "str"},
    "C9": {"DB_FIELD": "short_description", "TYPE": "str"},
    "C10": {"DB_FIELD": "description", "TYPE": "str"},
    "C13": {"DB_FIELD": "retail_price", "TYPE": "Decimal"},
    "C14": {"DB_FIELD": "sale_price", "TYPE": "Decimal"},
    "C17": {"DB_FIELD": "brand_name", "TYPE": "str"},
    "C21": {"DB_FIELD": "manufacturer_name", "TYPE": "str"},
}


class LinkShareFTPFormatterRuntime:

    # ------------------------------------------------------------------
    # Format One Row
    # ------------------------------------------------------------------

    def format_row(self, row):

        formatted = {}

        for index, value in enumerate(row):

            column = f"C{index + 1}"

            field_name = FIELD_MAPPING.get(
                column,
                {},
            ).get(
                "DB_FIELD",
                column,
            )

            formatted[field_name] = value.strip()

        return formatted

    # ------------------------------------------------------------------
    # Format File
    # ------------------------------------------------------------------

    def format(self, txt_path):

        txt_path = Path(txt_path)

        print(f"📄 FORMAT : {txt_path.name}")

        records = []

        with open(
            txt_path,
            "r",
            encoding="utf-8",
            errors="ignore",
        ) as fp:

            reader = csv.reader(
                fp,
                delimiter=FIXED_DELIMITER,
            )

            try:

                header = next(reader)

                if not header or header[0] != "HDR":
                    fp.seek(0)
                    reader = csv.reader(
                        fp,
                        delimiter=FIXED_DELIMITER,
                    )

            except StopIteration:

                return []

            for row in reader:

                if len(row) < 5:
                    continue

                if row[0] == "TRL":
                    continue

                records.append(
                    self.format_row(row)
                )

        print(f"✅ FORMATTED : {len(records):,}")

        return records


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="SHIN CORE LINX LinkShare FTP Formatter Runtime"
    )

    parser.add_argument(
        "--file",
        type=str,
        default="/tmp/linkshare/2557_3273700_mp.txt",
        help="Formatter対象TXTファイル",
    )

    parser.add_argument(
        "--limit",
        type=int,
        default=1,
        help="表示件数",
    )

    args = parser.parse_args()

    runtime = LinkShareFTPFormatterRuntime()

    records = runtime.format(args.file)

    print()

    for i, record in enumerate(records[:args.limit], start=1):

        print("=" * 80)
        print(f"RECORD {i}")
        print("=" * 80)

        for key, value in record.items():
            print(f"{key:<32}: {value}")

    print()
    print(f"TOTAL RECORDS : {len(records):,}")