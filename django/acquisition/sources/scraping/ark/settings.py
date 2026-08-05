#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

ARK Runtime Settings

Runtime Configuration

Responsibilities

- Runtime Configuration
- Fetch Runtime Configuration
- Affiliate Runtime Configuration
- Runtime Constants

Not Responsibilities

- Catalog Definition
- Reality Observation
- Runtime Translation
- Product Definition

Reality Catalog

    catalog.tsv

==============================================================================
"""

from __future__ import annotations

import platform

from pathlib import Path

# ==============================================================================
# Runtime
# ==============================================================================

BASE_DIR = Path(__file__).parent

# ==============================================================================
# Site
# ==============================================================================

SITE_NAME = "ark"

SOURCE_TYPE = "scraping"

SOURCE_NAME = SITE_NAME

BASE_URL = "https://www.ark-pc.co.jp"

# ==============================================================================
# Catalog
# ==============================================================================

CATALOG_FILE = BASE_DIR / "catalog.tsv"

# ==============================================================================
# Fetch Runtime
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
# Reality Runtime
# ==============================================================================

SYSTEM = platform.system()

IS_WINDOWS = SYSTEM == "Windows"

IS_LINUX = SYSTEM == "Linux"

# ------------------------------------------------------------------------------
# Reality Mode
# ------------------------------------------------------------------------------

if IS_WINDOWS:

    REALITY_MODE = "export"

elif IS_LINUX:

    REALITY_MODE = "import"

else:

    REALITY_MODE = "export"

print()

print("=" * 70)

print("🌍 REALITY MODE")

print("=" * 70)

print(f"Platform : {SYSTEM}")

print(f"Mode     : {REALITY_MODE}")

print("=" * 70)

# ==============================================================================
# Affiliate Runtime
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

    "pid": "892466351",

}