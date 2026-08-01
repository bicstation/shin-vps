#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Runtime Settings

Runtime Foundation

Reality First
==============================================================================
"""

from __future__ import annotations

from pathlib import Path


# ==========================================================
# Runtime
# ==========================================================

RUNTIME_VERSION = "v1"

ENCODING = "utf-8"

TSV_DELIMITER = "\t"


# ==========================================================
# Site
# ==========================================================

SITE_NAME = "LAVIE"

BASE_URL = "https://www.nec-lavie.jp"


# ==========================================================
# Fetch
# ==========================================================

USER_AGENT = (
    "Mozilla/5.0 "
    "(Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 "
    "(KHTML, like Gecko) "
    "Chrome/138.0.0.0 Safari/537.36"
)

TIMEOUT = 30


# ==========================================================
# Affiliate
# ==========================================================

AFFILIATE = {

    # True : Generate Affiliate URL
    # False: Use Reality URL

    "enabled": True,

    "provider": "valuecommerce",

    "sid": "3697471",

    "pid": "892670999",

}


# ==========================================================
# Directory
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent

SCRAPING_DIR = BASE_DIR.parent

SOURCE_DIR = SCRAPING_DIR.parent


# ==========================================================
# Runtime Directory
# ==========================================================

RUNTIME_DIR = (
    SOURCE_DIR
    / "runtime"
    / "lavie"
)

RUNTIME_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ==========================================================
# Runtime Seed
# ==========================================================

SEED_TSV = (
    RUNTIME_DIR
    / "seed.tsv"
)


# ==========================================================
# Runtime TSV
# ==========================================================

SERIES_LIST_TSV = (
    RUNTIME_DIR
    / "series_list.tsv"
)

MODEL_LIST_TSV = (
    RUNTIME_DIR
    / "model_list.tsv"
)

PRODUCT_LIST_TSV = (
    RUNTIME_DIR
    / "product_list.tsv"
)