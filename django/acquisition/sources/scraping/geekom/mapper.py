# /home/maya/shin-dev/shin-vps/django/acquisition/sources/scraping/geekom/mapper.py
#!/usr/bin/env python3
"""
mapper.py

GEEKOM Mapper Runtime

Observation
    ↓
Import Contract

Reality First
Observation First
"""

from __future__ import annotations

import json

from settings import (
    OBSERVATION_DIR,
    IMPORT_CONTRACT_DIR,
)


# ==========================================================
# Mapper
# ==========================================================

def map_observation(observation: dict) -> dict:

    images = observation.get("images", [])

    return {

        #
        # Source
        #

        "site": "GEEKOM",

        #
        # Product
        #

        "product_name": observation.get(
            "title",
            "",
        ),

        "product_url": observation.get(
            "url",
            "",
        ),

        "description": observation.get(
            "description",
            "",
        ),

        #
        # Media
        #

        "image_url": observation.get(
            "main_image",
            "",
        ),

        "images": images,

        #
        # Reality
        #

        "tables": observation.get(
            "tables",
            [],
        ),

        #
        # Observation
        #

        "observation": observation,

    }


# ==========================================================
# Main
# ==========================================================

def main():

    print("=" * 60)
    print("🗺️ GEEKOM MAPPER")
    print("=" * 60)

    files = sorted(
        OBSERVATION_DIR.glob("*.json")
    )

    print(f"Target : {len(files)}")
    print("-" * 60)

    for file in files:

        observation = json.loads(
            file.read_text(
                encoding="utf-8",
            )
        )

        contract = map_observation(
            observation
        )

        output = (
            IMPORT_CONTRACT_DIR
            / file.name
        )

        output.write_text(
            json.dumps(
                contract,
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )

        print(f"✓ {file.stem}")

    print("-" * 60)
    print(f"Saved : {IMPORT_CONTRACT_DIR}")
    print("=" * 60)
    print("COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()