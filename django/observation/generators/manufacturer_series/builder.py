# /home/maya/shin-vps/django/observation/generators/manufacturer_series/builder.py

"""
============================================================

SHIN CORE LINX

Observation Platform

Manufacturer Series Builder

============================================================

Observation Dataset

        ↓

Markdown

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from collections import defaultdict


# --------------------------------------------------
# Helper
# --------------------------------------------------

def append_list(

    lines,
    title,
    values,

):

    lines.append(title)

    if values:

        for value in values:

            lines.append(

                f"  • {value}"

            )

    else:

        lines.append(

            "  None"

        )

    lines.append("")


# --------------------------------------------------
# Build Markdown
# --------------------------------------------------

def build_markdown(

    dataset,

):

    """
    Build Manufacturer Series Observation Report.
    """

    lines = []

    # --------------------------------------------------
    # Header
    # --------------------------------------------------

    lines.append("# Manufacturer Series Observation")
    lines.append("")

    maker_groups = defaultdict(list)

    for record in dataset:

        maker_groups[
            record["maker"]
        ].append(
            record
        )

    total_series = sum(

        len(records)

        for records in maker_groups.values()

    )

    lines.append(

        f"Maker Count  : {len(maker_groups)}"

    )

    lines.append(

        f"Series Count : {total_series}"

    )

    lines.append("")

    # --------------------------------------------------
    # Makers
    # --------------------------------------------------

    for maker in sorted(

        maker_groups.keys()

    ):

        records = sorted(

            maker_groups[maker],

            key=lambda r: (

                -r["product_count"],

                r["series"],

            ),

        )

        maker_total = sum(

            r["product_count"]

            for r in records

        )

        lines.append("=" * 60)
        lines.append(f"Maker : {maker}")
        lines.append(f"Products : {maker_total}")
        lines.append("=" * 60)
        lines.append("")

        # --------------------------------------------------
        # Series
        # --------------------------------------------------

        for record in records:

            series = (

                record["series"]

                or "Unknown"

            )

            lines.append(
                f"■ {series}"
            )

            lines.append(
                "-" * 40
            )

            lines.append(
                f"Products : {record['product_count']}"
            )

            lines.append("")

            #
            # CPU
            #

            append_list(

                lines,

                "CPU Models",

                record["cpu_families"],

            )

            #
            # GPU
            #

            append_list(

                lines,

                "GPU Models",

                record["gpu_families"],

            )

            #
            # Memory
            #

            append_list(

                lines,

                "Memory",

                record["memory_range"],

            )

            #
            # Storage
            #

            append_list(

                lines,

                "Storage",

                record["storage_range"],

            )

            #
            # Display
            #

            append_list(

                lines,

                "Display",

                record["display_sizes"],

            )

            #
            # NPU
            #

            append_list(

                lines,

                "NPU",

                record["npu_presence"],

            )

            #
            # Price
            #

            lines.append("Price")

            lines.append(

                f"  Min : {record['price_min']}"

            )

            lines.append(

                f"  Max : {record['price_max']}"

            )

            lines.append("")

            #
            # Sample Products
            #

            lines.append("Examples")

            for product in record["sample_products"][:5]:

                lines.append(

                    f"  ✓ {product}"

                )

            lines.append("")

        lines.append("")

    return "\n".join(lines)