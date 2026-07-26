# //home/maya/shin-dev/shin-vps/django/imports/geekom/scripts/import.py
#!/usr/bin/env python3
"""
import.py

GEEKOM Observation Adapter

Observation JSON
        ↓
SHIN CORE LINX Contract

まだDBへ保存しない。
Contractを生成するだけ。
"""

from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent

OBSERVE_DIR = ROOT / "output" / "observation"
IMPORT_DIR = ROOT / "output" / "import"

IMPORT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


def build_contract(observation: dict):

    return {

        #
        # Source
        #
        "maker": "GEEKOM",
        "source": "geekom",

        #
        # Identity
        #
        "name": observation.get(
            "title",
            "",
        ),

        "description": observation.get(
            "description",
            "",
        ),

        #
        # Media
        #
        "images": observation.get(
            "images",
            [],
        ),

        #
        # Reality
        #
        "tables": observation.get(
            "tables",
            [],
        ),

        "scripts": observation.get(
            "scripts",
            [],
        ),

        #
        # Future Runtime
        #
        "brand": "",
        "series": "",
        "url": "",
        "price": None,
        "variants": [],
    }


def main():

    print("=" * 60)
    print("GEEKOM OBSERVATION ADAPTER")
    print("=" * 60)

    files = sorted(
        OBSERVE_DIR.glob("*.json")
    )

    print(f"Target : {len(files)}")

    print("-" * 60)

    for file in files:

        observation = json.loads(
            file.read_text(
                encoding="utf-8",
            )
        )

        contract = build_contract(
            observation
        )

        output = (
            IMPORT_DIR
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
    print(f"Saved : {IMPORT_DIR}")

    print("=" * 60)
    print("COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()