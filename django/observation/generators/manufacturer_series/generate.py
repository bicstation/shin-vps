#!/usr/bin/env python3

# /home/maya/shin-vps/django/observation/generators/manufacturer_series/generate.py

"""
============================================================

SHIN CORE LINX

Observation Platform

Manufacturer Series Generator

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
Observation Report

============================================================

Reality is NOT modified.

Generator orchestrates the Observation Layer.

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

from observation.common.loader import (
    load_products,
)

# --------------------------------------------------
# Collector
# --------------------------------------------------

from observation.generators.manufacturer_series.collector import (
    collect_observation_dataset,
)

# --------------------------------------------------
# Builder
# --------------------------------------------------

from observation.generators.manufacturer_series.builder import (
    build_markdown,
)

# --------------------------------------------------
# Writer
# --------------------------------------------------

from observation.generators.manufacturer_series.writer import (
    write_markdown,
)

# --------------------------------------------------
# Output
# --------------------------------------------------

OUTPUT = (
    ROOT
    / "observation"
    / "output"
    / "markdown"
    / "manufacturer_series_observation.md"
)

# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    #
    # Reality
    #

    products = load_products()

    #
    # Observation
    #

    dataset = collect_observation_dataset(

        products,

    )

    #
    # Markdown
    #

    markdown = build_markdown(

        dataset,

    )

    #
    # Write
    #

    write_markdown(

        OUTPUT,

        markdown,

    )

    #
    # Console
    #

    print()
    print("========================================")
    print(" SHIN CORE LINX")
    print(" Manufacturer Series Observation")
    print("========================================")
    print()
    print("Version      :", VERSION)
    print("Series Count :", len(dataset))
    print("Output       :", OUTPUT)
    print()
    print("Observation Completed.")
    print()


# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()