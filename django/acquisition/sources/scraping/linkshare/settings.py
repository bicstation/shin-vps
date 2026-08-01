#!/usr/bin/env python3
# ============================================================================
# SHIN CORE LINX
# LinkShare Runtime Settings
# ============================================================================

from __future__ import annotations

import os

# ============================================================================
# Site
# ============================================================================

SITE_NAME = "linkshare"

# ============================================================================
# FTP
# ============================================================================

FTP_HOST = os.getenv("LINKSHARE_FTP_HOST", "")
FTP_PORT = int(os.getenv("LINKSHARE_FTP_PORT", "21"))

FTP_USER = os.getenv("LINKSHARE_BC_USER", "")
FTP_PASS = os.getenv("LINKSHARE_BC_PASS", "")

FTP_TIMEOUT = int(
    os.getenv(
        "LINKSHARE_FTP_TIMEOUT",
        "180",
    )
)

# ============================================================================
# API
# ============================================================================

#
# Existing LinkShare OAuth Configuration
#

API_BASE_URL = "https://api.linksynergy.com/"

API_CLIENT_ID = os.getenv(
    "LS_CLIENT_ID",
    "",
)

API_CLIENT_SECRET = os.getenv(
    "LS_CLIENT_SECRET",
    "",
)

#
# Scope (SID)
#

API_ACCOUNT_ID = os.getenv(
    "LINKSHARE_BC_SID",
    "3273700",
)

#
# Runtime
#

API_TIMEOUT = int(
    os.getenv(
        "LINKSHARE_API_TIMEOUT",
        "30",
    )
)

API_DEFAULT_PAGE_SIZE = int(
    os.getenv(
        "LINKSHARE_API_PAGE_SIZE",
        "100",
    )
)

API_DEFAULT_MAX_PAGES = int(
    os.getenv(
        "LINKSHARE_API_MAX_PAGES",
        "0",
    )
)

API_REQUEST_INTERVAL = float(
    os.getenv(
        "LINKSHARE_API_REQUEST_INTERVAL",
        "0.6",
    )
)

# ============================================================================
# Affiliate
# ============================================================================

AFFILIATE = {

    "affiliate_name": "linkshare",

    "base_url": "https://click.linksynergy.com/",

}

# ============================================================================
# Merchant Mapping
# ============================================================================

LINKSHARE_MID_MAP = {

    "35909": {
        "maker": "hp",
        "prefix": "HP",
    },

    "2557": {
        "maker": "dell",
        "prefix": "DELL",
    },

    "2543": {
        "maker": "fujitsu",
        "prefix": "FUJITSU",
    },

    "36508": {
        "maker": "dynabook",
        "prefix": "DYNABOOK",
    },

    "43708": {
        "maker": "asus",
        "prefix": "ASUS",
    },

}