#!/usr/bin/env python3
"""
==============================================================================
OZ GAMING Runtime Settings
==============================================================================
"""

from __future__ import annotations


# ==========================================================
# Site
# ==========================================================

SITE_NAME = "ozgaming"

BASE_URL = "https://www.ozgaming-pcshop.com"


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

    # Provider
    "provider": "a8",

    # A8 Material ID
    "a8mat": "4B88SU+B5C71E+5U1O+BW0YB",

}