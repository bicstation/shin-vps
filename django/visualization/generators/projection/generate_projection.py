# /home/maya/shin-vps/django/visualization/generators/projection/generate_projection.py

#!/usr/bin/env python3

# /home/maya/shin-vps/django/visualization/generators/projection/generate_projection.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Projection Generator

============================================================

Reality
        ↓
Loader
        ↓
Collector
        ↓
Builder
        ↓
Writer
        ↓
Markdown

============================================================

Reality is NOT modified.

Generator orchestrates the Projection Layer.

============================================================
"""

# --------------------------------------------------
# Version
# --------------------------------------------------

VERSION = "1.0"

# --------------------------------------------------
# Imports
# --------------------------------------------------

from pathlib import Path

import os
import sys

ROOT = Path(__file__).resolve().parents[3]

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "tiper_api.settings",
)

import django

django.setup()

# --------------------------------------------------
# Loader
# --------------------------------------------------

from visualization.generators.projection.projection_loader import (

    load_products,

)

# --------------------------------------------------
# Collector
# --------------------------------------------------

from visualization.generators.projection.projection_collector import (

    collect_projection,
    collect_summary,

)

# --------------------------------------------------
# Builder
# --------------------------------------------------

from visualization.generators.projection.projection_builder import (

    build_projection,

)

# --------------------------------------------------
# Writer
# --------------------------------------------------

from visualization.generators.projection.projection_writer import (

    write_markdown,

)

# --------------------------------------------------
# Output
# --------------------------------------------------

OUTPUT = (

    ROOT
    / "visualization"
    / "projection"

)

OUTPUT_FILE = (

    OUTPUT
    / "projection.md"

)

# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    #
    # Load
    #

    products = load_products()

    #
    # Collect
    #

    projections = collect_projection(

        products,

    )

    summary = collect_summary(

        projections,

    )

    #
    # Build
    #

    markdown = build_projection(

        projections,

    )

    #
    # Write
    #

    write_markdown(

        OUTPUT_FILE,
        markdown,

    )

    #
    # Console
    #

    print()
    print("========================================")
    print(" SHIN CORE LINX")
    print(" Projection")
    print("========================================")
    print()
    print("Version       :", VERSION)
    print("Product Count :", summary["product_count"])
    print("Output        :", OUTPUT_FILE)
    print()
    print("Projection Ready.")
    print()

# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()