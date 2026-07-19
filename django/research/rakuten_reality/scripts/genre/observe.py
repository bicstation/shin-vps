"""
Rakuten Genre Reality Research

Observation

Responsibility
--------------
Extract the observable structure from a Genre API response.

This module MUST NOT:

- Call APIs
- Save Files
- Generate Semantic Data
- Traverse the genre tree recursively
"""

from __future__ import annotations

from typing import Any


def create_observation(
    raw: dict[str, Any],
) -> dict[str, Any]:
    """
    Extract observable fields from the Genre API response.
    """

    return {
        "genre": raw.get("genre"),
        "ancestors": raw.get("ancestors", []),
        "siblings": raw.get("siblings", []),
        "children": raw.get("children", []),
        "attributes": raw.get("attributes", []),
    }


def create_summary(
    observation: dict[str, Any],
) -> dict[str, Any]:
    """
    Create a simple observation summary.
    """

    genre = observation.get("genre") or {}

    return {
        "genre_id": genre.get("genreId"),
        "genre_name": genre.get("genreName"),
        "level": genre.get("genreLevel"),
        "ancestor_count": len(observation.get("ancestors", [])),
        "sibling_count": len(observation.get("siblings", [])),
        "child_count": len(observation.get("children", [])),
        "attribute_count": len(observation.get("attributes", [])),
    }