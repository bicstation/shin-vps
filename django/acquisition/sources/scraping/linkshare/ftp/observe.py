# /home/maya/shin-dev/shin-vps/django/acquisition/sources/scraping/linkshare/ftp/observe.py

# /home/maya/shin-dev/shin-vps/django/acquisition/sources/scraping/linkshare/ftp/observe.py
# ============================================================================
# SHIN CORE LINX
# LinkShare FTP Observation Runtime
# ============================================================================
#
# Responsibilities
#
# - Observe Reality
# - Normalize Observation
# - Preserve Evidence
#
# NOT
#
# - AI Analysis
# - Semantic Mapping
# - Database
# - Runtime Decision
# ============================================================================

import argparse
from pprint import pprint

# from acquisition.sources.scraping.linkshare.ftp.formatter import (
#     LinkShareFTPFormatterRuntime,
# )

from formatter import LinkShareFTPFormatterRuntime

class LinkShareFTPObservationRuntime:

    # ------------------------------------------------------------------
    # Observe One Record
    # ------------------------------------------------------------------

    def observe(self, record):

        manufacturer = (
            record.get("manufacturer_name")
            or record.get("manufacturer_name_fallback")
            or ""
        )

        observation = {

            # ----------------------------------------------------------
            # Identity
            # ----------------------------------------------------------

            "sku": record.get("sku", ""),
            "link_id": record.get("link_id", ""),

            # ----------------------------------------------------------
            # Product
            # ----------------------------------------------------------

            "title": record.get("product_name_orig", ""),
            "brand": record.get("brand_name", ""),
            "manufacturer": manufacturer,

            # ----------------------------------------------------------
            # Content
            # ----------------------------------------------------------

            "short_description": record.get(
                "short_description",
                "",
            ),

            "description": record.get(
                "description",
                "",
            ),

            "category": record.get(
                "primary_category",
                "",
            ),

            # ----------------------------------------------------------
            # Assets
            # ----------------------------------------------------------

            "product_url": record.get(
                "product_url",
                "",
            ),

            "buy_url": record.get(
                "buy_url",
                "",
            ),

            "image_url": record.get(
                "image_url",
                "",
            ),

            # ----------------------------------------------------------
            # Commerce
            # ----------------------------------------------------------

            "retail_price": record.get(
                "retail_price",
                "",
            ),

            "sale_price": record.get(
                "sale_price",
                "",
            ),

            # ----------------------------------------------------------
            # Raw Reality
            # ----------------------------------------------------------

            "raw": record,
        }

        return observation

    # ------------------------------------------------------------------
    # Observe Many
    # ------------------------------------------------------------------

    def observe_many(self, records):

        observations = []

        for record in records:

            observations.append(
                self.observe(record)
            )

        return observations


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="SHIN CORE LINX LinkShare FTP Observation Runtime"
    )

    parser.add_argument(
        "--file",
        type=str,
        default="/tmp/linkshare/2557_3273700_mp.txt",
        help="Observation対象TXT",
    )

    parser.add_argument(
        "--limit",
        type=int,
        default=1,
        help="表示件数",
    )

    args = parser.parse_args()

    formatter = LinkShareFTPFormatterRuntime()

    records = formatter.format(
        args.file,
    )

    runtime = LinkShareFTPObservationRuntime()

    observations = runtime.observe_many(
        records,
    )

    print()

    for index, observation in enumerate(
        observations[: args.limit],
        start=1,
    ):

        print("=" * 80)
        print(f"OBSERVATION {index}")
        print("=" * 80)

        pprint(
            observation,
            sort_dicts=False,
        )

    print()
    print(f"TOTAL OBSERVATIONS : {len(observations):,}")