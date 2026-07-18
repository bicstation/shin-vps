# /home/maya/shin-dev/shin-vps/django/research/rakuten_reality/scripts/config.py

"""
Rakuten Reality Research

Configuration

Responsibility
--------------
Provide shared configuration for the Reality Observation Pipeline.

This module MUST ONLY define configuration values.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


# ==========================================================
# Project
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent

PROJECT_DIR = BASE_DIR.parent

load_dotenv(PROJECT_DIR / ".env")

OUTPUT_DIR = PROJECT_DIR / "output"

RAW_DIR = OUTPUT_DIR / "raw"

OBSERVATION_DIR = OUTPUT_DIR / "observation"

PAYLOAD_DIR = OUTPUT_DIR / "payload"


# ==========================================================
# Rakuten API
# ==========================================================

BASE_URL = (
    "https://openapi.rakuten.co.jp/ichibams/api/"
    "IchibaItem/Search/20260701"
)

APPLICATION_ID = os.getenv("RAKUTEN_APPLICATION_ID", "")

ACCESS_KEY = os.getenv("RAKUTEN_ACCESS_KEY", "")


# ==========================================================
# Runtime
# ==========================================================

DEFAULT_TIMEOUT = 30

DEFAULT_HITS = 30

REQUEST_INTERVAL = 2.0


# ==========================================================
# Observation
# ==========================================================

OBSERVATION_SOURCE = "rakuten"

OBSERVATION_VERSION = "1.0"