#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Runtime Settings

Catalog Runtime Foundation

Reality First
==============================================================================
"""

from __future__ import annotations

from pathlib import Path


# ==============================================================================
# Runtime
# ==============================================================================

RUNTIME_VERSION = "v1"

ENCODING = "utf-8"

TSV_DELIMITER = "\t"


# ==============================================================================
# Site
# ==============================================================================

SITE_NAME = "LAVIE"

BASE_URL = "https://www.nec-lavie.jp"


# ==============================================================================
# HTTP
# ==============================================================================

USER_AGENT = (
    "Mozilla/5.0 "
    "(Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 "
    "(KHTML, like Gecko) "
    "Chrome/138.0.0.0 "
    "Safari/537.36"
)

TIMEOUT = 30


# ==============================================================================
# Affiliate
# ==============================================================================

AFFILIATE = {

    #
    # False:
    #   Use Reality URL
    #
    # True:
    #   Generate Affiliate URL
    #

    "enabled": True,

    "provider": "valuecommerce",

    "sid": "3697471",

    "pid": "892670999",

}


# ==============================================================================
# Directory
# ==============================================================================

BASE_DIR = Path(__file__).resolve().parent

SCRAPING_DIR = BASE_DIR.parent

SOURCE_DIR = SCRAPING_DIR.parent


# ==============================================================================
# Runtime Directory
# ==============================================================================

RUNTIME_DIR = (
    SOURCE_DIR
    / "runtime"
    / SITE_NAME.lower()
)

RUNTIME_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ==============================================================================
# Runtime TSV
# ==============================================================================

CATALOG_TSV = (
    RUNTIME_DIR
    / "catalog.tsv"
)

SERIES_TSV = (
    RUNTIME_DIR
    / "series.tsv"
)

CARDS_TSV = (
    RUNTIME_DIR
    / "cards.tsv"
)