#!/usr/bin/env python3
"""
==============================================================================
LENOVO Runtime Settings

SHIN CORE LINX

Reality First

Responsibilities

- Runtime Configuration
- Fetch Runtime Configuration
- Reality Runtime Configuration
- Affiliate Runtime Configuration
- Runtime Constants

Not Responsibilities

- Catalog Definition
- Reality Observation
- Runtime Translation
- Product Definition

==============================================================================
"""

from __future__ import annotations

import os

from pathlib import Path

# ==============================================================================
# Runtime
# ==============================================================================

RUNTIME_VERSION = "v2"

SOURCE_NAME = "lenovo"

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

SITE_NAME = "LENOVO"

BASE_URL = "https://www.lenovo.com"

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

    # --------------------------------------------------------------------------
    # Runtime
    # --------------------------------------------------------------------------

    "enabled": True,

    # --------------------------------------------------------------------------
    # Provider
    # --------------------------------------------------------------------------

    "provider": "valuecommerce",

    # --------------------------------------------------------------------------
    # Credentials
    # --------------------------------------------------------------------------

    "sid": "3697471",

    "pid": "892455531",

}

# ==============================================================================
# Reality
# ==============================================================================

SEED_TSV = (

    BASE_DIR

    / "seed.tsv"

)