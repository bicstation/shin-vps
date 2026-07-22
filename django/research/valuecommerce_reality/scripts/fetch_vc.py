# =========================================================
# FILE:
# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/fetch_vc.py
# =========================================================

"""
ValueCommerce Reality Research

Entry Point

Responsibility
--------------
Parse command line arguments and execute the Reality Observation pipeline.

This module MUST NOT:
- Call APIs directly
- Generate Observations
- Validate Data
- Map Payloads
- Save Files
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "tiper_api.settings",
)

import django

django.setup()

from orchestrator import run


# =====================================================
# Parse Arguments
# =====================================================

def parse_args() -> argparse.Namespace:

    parser = argparse.ArgumentParser(
        description="ValueCommerce Reality Research",
    )

    parser.add_argument(
        "--keyword",
        type=str,
        default="ThinkPad",
        help="Search keyword",
    )

    parser.add_argument(
        "--maker",
        type=str,
        default="Lenovo",
        help="Manufacturer name",
    )

    parser.add_argument(
        "--page",
        type=int,
        default=1,
        help="Page number",
    )

    return parser.parse_args()


# =====================================================
# Main
# =====================================================

def main() -> None:

    args = parse_args()

    run(
        keyword=args.keyword,
        maker=args.maker,
        page=args.page,
    )


if __name__ == "__main__":
    main()