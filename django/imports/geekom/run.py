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

from imports.geekom.pipeline import run as reality_pipeline

from imports.integration.orchestrator import ImportOrchestrator

# ==========================================================
# Import Contract
# ==========================================================

CONTRACT_PATH = (
    PROJECT_DIR
    / "imports"
    / "geekom"
    / "output"
    / "import_contract"
    / "products.json"
)


# ==========================================================
# Run
# ==========================================================

def main() -> None:
    """Execute TSUKUMO Import Runtime."""

    # ------------------------------------------------------
    # Reality Pipeline
    # ------------------------------------------------------

    reality_pipeline()

    # ------------------------------------------------------
    # Import Pipeline
    # ------------------------------------------------------

    orchestrator = ImportOrchestrator()

    results = orchestrator.run(
        json_path=CONTRACT_PATH,
        maker="GEEKOM",
        prefix="GEEKOM",
    )

    return results


if __name__ == "__main__":
    main()