# /home/maya/shin-dev/shin-vps/django/visualization/generators/api/generate_api.py

#!/usr/bin/env python3

# /home/maya/shin-dev/shin-vps/django/visualization/generators/api/generate_api.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

API Generator

============================================================

API Runtime
        ↓
Loader
        ↓
Collector
        ↓
Builder
        ↓
Writer
        ↓
API Observation

============================================================

Reality is NOT modified.

Generator orchestrates the API Layer.

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
import time

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

from visualization.generators.api.api_loader import (

    load_discover_api,

)

# --------------------------------------------------
# Collector
# --------------------------------------------------

from visualization.generators.api.api_collector import (

    collect_api,
    collect_summary,
    collect_health,

)

# --------------------------------------------------
# Builder
# --------------------------------------------------

from visualization.generators.api.api_builder import (

    build_api,
    build_summary,
    build_health_report,

)

# --------------------------------------------------
# Writer
# --------------------------------------------------

from visualization.generators.api.api_writer import (

    write_api,
    write_summary,
    write_health_report,

)

# --------------------------------------------------
# Output
# --------------------------------------------------

OUTPUT = (
    ROOT
    / "visualization"
    / "api"
)

# --------------------------------------------------
# Configuration
# --------------------------------------------------

BASE_URL = "http://127.0.0.1:8000"

# --------------------------------------------------
# Generate API
# --------------------------------------------------

def generate_api(

    observation,

):

    markdown = build_api(

        observation,

    )

    write_api(

        OUTPUT / "discover.md",

        markdown,

    )

# --------------------------------------------------
# Generate Summary
# --------------------------------------------------

def generate_summary(

    observations,

):

    #
    # Phase 2
    #

    # summary = collect_summary(
    #     observations,
    # )

    # markdown = build_summary(
    #     summary,
    # )

    # write_summary(
    #     OUTPUT / "summary.md",
    #     markdown,
    # )

    return

# --------------------------------------------------
# Generate Health Report
# --------------------------------------------------

def generate_health(

    observations,

):

    #
    # Future
    #

    # health = collect_health(
    #     observations,
    # )

    # markdown = build_health_report(
    #     health,
    # )

    # write_health_report(
    #     OUTPUT / "health.md",
    #     markdown,
    # )

    return

# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    observations = []

    #
    # Discover API
    #

    start = time.perf_counter()

    payload = load_discover_api(

        BASE_URL,

    )

    elapsed = int(

        (
            time.perf_counter()
            - start
        ) * 1000

    )

    observation = collect_api(

        endpoint="/api/pc/discover-universe/",

        payload=payload,

        status=200,

        elapsed=elapsed,

    )

    observations.append(

        observation,

    )

    #
    # Generate
    #

    generate_api(

        observation,

    )

    generate_summary(

        observations,

    )

    generate_health(

        observations,

    )

    #
    # Console
    #

    print()
    print("========================================")
    print(" SHIN CORE LINX")
    print(" API Generator")
    print("========================================")
    print()
    print("Version   :", VERSION)
    print("Endpoint  :", observation["endpoint"])
    print("Status    :", observation["status"])
    print("Elapsed   :", observation["elapsed"], "ms")
    print()
    print("API Observation Completed.")
    print()

# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()