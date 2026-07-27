#!/usr/bin/env python3
"""
ARK Runtime Settings
"""

# ==========================================================
# Site
# ==========================================================

SITE_NAME = "ark"

BASE_URL = "https://www.ark-pc.co.jp"


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

    # True: Generate affiliate URL
    # False: Use original product URL
    "enabled": True,

    # Affiliate Provider
    "provider": "valuecommerce",

    # ValueCommerce SID / PID
    "sid": "3697471",

    "pid": "892466351",

}