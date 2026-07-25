#!/usr/bin/env python3
"""
GEEKOM Formatter

Observation
    ↓
Payload

Reality First
Observation First
"""

from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parent.parent

OBSERVATION_DIR = BASE_DIR / "output" / "observation"

PAYLOAD_DIR = BASE_DIR / "output" / "payload"
PAYLOAD_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = PAYLOAD_DIR / "products.json"


def build_payload(observation: dict) -> dict:
    """
    Observation
        ↓
    Payload
    """

    return {

        #
        # Source
        #
        "source": "geekom",
        "maker": observation.get("maker", "GEEKOM"),

        #
        # Identity
        #
        "identity": {
            "title": observation.get("title", ""),
            "url": observation.get("url", ""),
            "brand": observation.get("brand", ""),
            "series": observation.get("series", ""),
        },

        #
        # Content
        #
        "content": {
            "description": observation.get("description", ""),
            "tables": observation.get("tables", []),
            "scripts": observation.get("scripts", []),
        },

        #
        # Media
        #
        "media": {
            "images": observation.get("images", []),
        },

        #
        # Keep Observation
        #
        "observation": observation,
    }


def main():

    print("=" * 60)
    print("GEEKOM FORMATTER")
    print("=" * 60)

    results = []

    files = sorted(
        OBSERVATION_DIR.glob("*.json")
    )

    print(f"Target : {len(files)}")

    for file in files:

        observation = json.loads(
            file.read_text(
                encoding="utf-8"
            )
        )

        payload = build_payload(
            observation
        )

        results.append(payload)

        print(f"✓ {file.stem}")

    OUTPUT_FILE.write_text(
        json.dumps(
            results,
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print("-" * 60)
    print(f"Products : {len(results)}")
    print(f"Saved    : {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()