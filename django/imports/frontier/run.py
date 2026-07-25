#!/usr/bin/env python3
"""
FRONTIER Import Runner
"""

from pathlib import Path
import sys


# ==========================================================
# Python Path
# ==========================================================

PROJECT_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_DIR))


# ==========================================================
# Pipeline
# ==========================================================

from imports.frontier.pipeline import run as run_pipeline

from imports.integration.orchestrator import ImportOrchestrator


# ==========================================================
# Contract
# ==========================================================

CONTRACT_PATH = (
    PROJECT_DIR
    / "imports"
    / "frontier"
    / "output"
    / "import_contract"
    / "products.json"
)


# ==========================================================
# Main
# ==========================================================

def main() -> None:

    # ------------------------------------------------------
    # Reality Pipeline
    # ------------------------------------------------------

    run_pipeline()

    # ------------------------------------------------------
    # Import Runtime
    # ------------------------------------------------------

    orchestrator = ImportOrchestrator()

    return orchestrator.run(
        json_path=CONTRACT_PATH,
        maker="FRONTIER",
        prefix="FRONTIER",
    )


if __name__ == "__main__":
    main()