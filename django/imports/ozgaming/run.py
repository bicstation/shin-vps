#!/usr/bin/env python3

from pathlib import Path
import sys

# ==========================================================
# Python Path
# ==========================================================

PROJECT_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_DIR))

# ==========================================================
# Import
# ==========================================================

from imports.ozgaming.scripts.fetch_list import fetch
from imports.ozgaming.scripts.formatter_list import parse
from imports.ozgaming.scripts.mapper import main as mapper

from imports.integration.orchestrator import ImportOrchestrator

# ==========================================================
# Import Contract
# ==========================================================

CONTRACT_PATH = (
    PROJECT_DIR
    / "imports"
    / "ozgaming"
    / "output"
    / "import_contract"
    / "products.json"
)


# ==========================================================
# Main
# ==========================================================

def main():

    print("=" * 60)
    print("OZ GAMING IMPORT PIPELINE")
    print("=" * 60)

    # ------------------------------------------------------
    # Reality
    # ------------------------------------------------------

    print("\n[1/4] Fetch Reality")
    fetch()

    print("\n[2/4] Format Payload")
    parse()

    print("\n[3/4] Build Import Contract")
    mapper()

    # ------------------------------------------------------
    # Integration
    # ------------------------------------------------------

    print("\n[4/4] Import Runtime")

    orchestrator = ImportOrchestrator()

    results = orchestrator.run(
        json_path=CONTRACT_PATH,
        maker="OZ GAMING",
        prefix="OZ",
    )

    print("\n" + "=" * 60)
    print("OZ GAMING IMPORT COMPLETED")
    print("=" * 60)

    return results


# ==========================================================
# Entry Point
# ==========================================================

if __name__ == "__main__":
    main()