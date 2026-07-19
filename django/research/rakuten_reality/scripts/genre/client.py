"""
Rakuten Genre Reality Research

Client

Responsibility
--------------
Communicate with the Rakuten Ichiba Genre Search API.

Input
-----
Genre ID

Output
------
Raw JSON response

This module MUST NOT:

- Generate Observations
- Validate Data
- Save Files
"""

from __future__ import annotations

from pathlib import Path
from typing import Any
import sys

import requests

SCRIPT_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = SCRIPT_DIR.parent

if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from config import (
    ACCESS_KEY,
    APPLICATION_ID,
    DEFAULT_TIMEOUT,
)

GENRE_API_URL = (
    "https://openapi.rakuten.co.jp/"
    "ichibagt/api/IchibaGenre/Search/20260701"
)


def build_params(
    *,
    genre_id: str,
) -> dict[str, Any]:
    """
    Build Genre API request parameters.
    """

    return {
        "applicationId": APPLICATION_ID,
        "accessKey": ACCESS_KEY,
        "format": "json",
        "genreId": genre_id,
    }


def fetch_genre(
    *,
    genre_id: str,
) -> dict[str, Any]:
    """
    Fetch a genre from the Rakuten Genre Search API.
    """

    response = requests.get(
        GENRE_API_URL,
        params=build_params(
            genre_id=genre_id,
        ),
        timeout=DEFAULT_TIMEOUT,
    )

    response.raise_for_status()

    return response.json()