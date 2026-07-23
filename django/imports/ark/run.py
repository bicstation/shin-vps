# /home/maya/shin-vps/django/imports/ark/run.py

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

from imports.ark.scripts.fetch_list import fetch
from imports.ark.scripts.formatter_list import parse
from imports.ark.scripts.mapper import main as mapper

from imports.integration.orchestrator import ImportOrchestrator

# ==========================================================

CONTRACT_PATH = (
    PROJECT_DIR
    / "imports"
    / "ark"
    / "output"
    / "import_contract"
    / "products.json"
)


def main() -> None:
    # ------------------------------------------------------
    # Reality
    # ------------------------------------------------------

    fetch()
    parse()
    mapper()

    # ------------------------------------------------------
    # Integration
    # ------------------------------------------------------

    orchestrator = ImportOrchestrator()

    results = orchestrator.run(
        json_path=CONTRACT_PATH,
        maker="ARK",
        prefix="ARK",
    )

    return results


if __name__ == "__main__":
    main()