# /home/maya/shin-dev/shin-vps/django/research/rakuten_reality/scripts/fetch_rakuten.py

"""
Rakuten Reality Research

Entry Point

Responsibility
--------------
Parse command line arguments and execute the
Reality Observation pipeline.

This module MUST NOT:

- Call APIs directly
- Generate Observations
- Validate Data
- Map Payloads
- Save Files
"""

from __future__ import annotations

import argparse

from orchestrator import run


def parse_args() -> argparse.Namespace:
    """
    Parse command line arguments.
    """

    parser = argparse.ArgumentParser(
        description="Rakuten Reality Research"
    )

    parser.add_argument(
        "--keyword",
        type=str,
        default=None,
        help="Search keyword",
    )

    parser.add_argument(
        "--shop",
        dest="shop_code",
        type=str,
        default=None,
        help="Rakuten shop code",
    )

    parser.add_argument(
        "--item",
        dest="item_code",
        type=str,
        default=None,
        help="Rakuten item code",
    )

    parser.add_argument(
        "--genre",
        dest="genre_id",
        type=str,
        default=None,
        help="Rakuten genre ID",
    )

    parser.add_argument(
        "--page",
        type=int,
        default=1,
        help="Page number",
    )

    parser.add_argument(
        "--hits",
        type=int,
        default=30,
        help="Number of items per page",
    )

    return parser.parse_args()


def main() -> None:
    """
    Application entry point.
    """

    args = parse_args()

    run(
        keyword=args.keyword,
        shop_code=args.shop_code,
        item_code=args.item_code,
        genre_id=args.genre_id,
        page=args.page,
        hits=args.hits,
    )


if __name__ == "__main__":
    main()