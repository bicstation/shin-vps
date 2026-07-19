# /home/maya/shin-vps/django/research/rakuten_reality/scripts/genre/fetch_genres.py

"""
Rakuten Genre Reality Research

Entry Point

Responsibility
--------------
Parse command line arguments and execute the
Genre Reality pipeline.

Pipeline
--------
fetch_genre
    ↓
save_raw
    ↓
create_observation
    ↓
save_genre_tree
    ↓
create_summary

This module MUST NOT:

- Call HTTP APIs directly
- Implement Observation logic
- Implement Export logic
"""

from __future__ import annotations

import argparse

from client import fetch_genre
from exporter import save_raw, save_genre_tree
from observe import create_observation, create_summary


def parse_args() -> argparse.Namespace:
    """
    Parse command line arguments.
    """

    parser = argparse.ArgumentParser(
        description="Rakuten Genre Reality Research"
    )

    parser.add_argument(
        "--genre",
        dest="genre_id",
        type=str,
        required=True,
        help="Rakuten Genre ID",
    )

    return parser.parse_args()


def main() -> None:
    """
    Application entry point.
    """

    args = parse_args()

    # ------------------------------------------------------------------
    # Fetch Reality
    # ------------------------------------------------------------------

    raw_json = fetch_genre(
        genre_id=args.genre_id,
    )

    filename = f"genre_{args.genre_id}.json"

    save_raw(
        filename,
        raw_json,
    )

    # ------------------------------------------------------------------
    # Observe Reality
    # ------------------------------------------------------------------

    observation = create_observation(
        raw_json,
    )

    save_genre_tree(
        filename,
        observation,
    )

    summary = create_summary(
        observation,
    )

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------

    print("=" * 60)
    print("Rakuten Genre Reality Research")
    print("=" * 60)
    print()

    print(f"Genre ID       : {summary['genre_id']}")
    print(f"Genre Name     : {summary['genre_name']}")
    print(f"Level          : {summary['level']}")
    print()

    print(f"Ancestors      : {summary['ancestor_count']}")
    print(f"Siblings       : {summary['sibling_count']}")
    print(f"Children       : {summary['child_count']}")
    print(f"Attributes     : {summary['attribute_count']}")
    print()

    print(f"Raw JSON       : {filename}")
    print(f"Observation    : {filename}")
    print()


if __name__ == "__main__":
    main()