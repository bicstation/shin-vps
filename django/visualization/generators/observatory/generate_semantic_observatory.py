# /home/maya/shin-dev/shin-vps/django/visualization/generators/observatory/generate_semantic_observatory.py

#!/usr/bin/env python3

"""
============================================================

SHIN CORE LINX

Visualization Platform

Semantic Observatory Generator

============================================================

Evidence
        ↓
Observation
        ↓
Markdown
        ↓
Output

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

from visualization.generators.observatory.observatory_loader import (

    load_groups,
    get_universe,
    load_evidence,
    get_observatory_file,

)

# --------------------------------------------------
# Collector
# --------------------------------------------------

from visualization.generators.observatory.observatory_collector import (

    collect_observation,
    collect_observatory,

)

# --------------------------------------------------
# Builder
# --------------------------------------------------

from visualization.generators.observatory.observatory_builder import (

    build_observatory,

)

# --------------------------------------------------
# Writer
# --------------------------------------------------

from visualization.generators.observatory.observatory_writer import (

    write_markdown,

)

# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    groups = load_groups()

    observatory = {}

    # ------------------------------------------
    # Collect
    # ------------------------------------------

    for group in groups:

        universe = get_universe(
            group,
        )

        entity = group["group_slug"]

        evidence = load_evidence(

            universe,

            entity,

        )

        observation = collect_observation(

            group,

            evidence,

        )

        observatory.setdefault(

            universe,

            []

        ).append(

            observation,

        )

    # ------------------------------------------
    # Build & Write
    # ------------------------------------------

    for universe, observations in observatory.items():

        observations = collect_observatory(

            observations,

        )

        markdown = build_observatory(

            universe,

            observations,

        )

        output = get_observatory_file(

            universe,

        )

        write_markdown(

            output,

            markdown,

        )

        print(

            f"[OK] {universe}"

        )

# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()