#!/usr/bin/env python3

# ==============================================================================
#
# FILE:
# acquisition/sources/scraping/hp/settings.py
#
# SHIN CORE LINX
#
# HP Runtime Settings
#
# Reality First
#
# Responsibilities
#
# - Runtime Configuration
# - Fetch Runtime Configuration
# - Reality Runtime Configuration
# - Affiliate Runtime Configuration
# - Runtime Constants
#
# NOT Responsibilities
#
# - Catalog Definition
# - Reality Observation
# - Runtime Translation
# - Product Definition
#
# ==============================================================================

from __future__ import annotations

import os

from pathlib import Path


# ==============================================================================
# Runtime
# ==============================================================================

RUNTIME_VERSION = "v2"

SOURCE_NAME = "hp"

ENCODING = "utf-8"

TSV_DELIMITER = "\t"

BASE_DIR = Path(__file__).resolve().parent

SCRAPING_DIR = BASE_DIR.parent

SOURCE_DIR = SCRAPING_DIR.parent


# ==============================================================================
# Environment
# ==============================================================================

#
# .env
#
# RUNTIME_ENV=local
# RUNTIME_ENV=vps
#

RUNTIME = os.getenv(
    "RUNTIME_ENV",
    "vps",
)


# ==============================================================================
# Reality Runtime
# ==============================================================================

if RUNTIME == "local":

    REALITY_MODE = "export"

elif RUNTIME == "vps":

    REALITY_MODE = "import"

else:

    raise RuntimeError(
        f"Unknown Runtime : {RUNTIME}"
    )


print()

print("=" * 70)

print("🌍 REALITY MODE")

print("=" * 70)

print(f"Runtime  : {RUNTIME}")

print(f"Mode     : {REALITY_MODE}")

print("=" * 70)


# ==============================================================================
# Site
# ==============================================================================

SITE_NAME = "HP"

BASE_URL = "https://jp.ext.hp.com"

LOCALE_PREFIX = ""


# ==============================================================================
# HTTP
# ==============================================================================

USER_AGENT = (
    "Mozilla/5.0 "
    "(Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 "
    "(KHTML, like Gecko) "
    "Chrome/138.0.0.0 Safari/537.36"
)

TIMEOUT = 30


# ==============================================================================
# Affiliate
# ==============================================================================

AFFILIATE = {

    "enabled": True,
    "provider": "linkshare",  
    "id":"nNBA6GzaGrQ",
    "mid": "35909",

}


# ==============================================================================
# Reality
# ==============================================================================

SEED_TSV = (
    BASE_DIR
    / "seed.tsv"
)