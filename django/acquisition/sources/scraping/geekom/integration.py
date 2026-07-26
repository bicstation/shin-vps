#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/geekom/integration.py

SHIN CORE LINX
GEEKOM Integration Runtime

Pipeline

Import Contract
        │
        ▼
Import Builder
        │
        ▼
Payload JSON
==============================================================================
"""

from __future__ import annotations

import json
from pathlib import Path
import sys

# ==========================================================
# Project Root
# ==========================================================

ROOT_DIR = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT_DIR))

from acquisition.integration.builder import ImportBuilder

from settings import (
    AFFILIATE,
    IMPORT_CONTRACT_DIR,
    PAYLOAD_DIR,
    SITE_NAME,
)

# ==========================================================
# Builder
# ==========================================================

builder = ImportBuilder()


# ==========================================================
# Integration
# ==========================================================

def integrate(
    contract: dict,
) -> dict:
    """
    Build Integration Payload.
    """

    return builder.build(
        contract=contract,
        affiliate_config=AFFILIATE,
        maker=SITE_NAME,
        prefix=SITE_NAME.upper(),
    )


# ==========================================================
# Main
# ==========================================================

def main():

    print("=" * 60)
    print("🔗 GEEKOM INTEGRATION")
    print("=" * 60)

    files = sorted(
        IMPORT_CONTRACT_DIR.glob("*.json")
    )

    print(f"Target : {len(files)}")
    print("-" * 60)

    payloads = []

    for file in files:

        contract = json.loads(
            file.read_text(
                encoding="utf-8",
            )
        )

        payload = integrate(contract)

        payloads.append(payload)

        print(f"✓ {file.stem}")

    output = PAYLOAD_DIR / "products.json"

    output.write_text(
        json.dumps(
            payloads,
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print("-" * 60)
    print(f"Items : {len(payloads)}")
    print(f"Saved : {output}")
    print("=" * 60)
    print("COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()