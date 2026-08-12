"""
GMKtec Importer Settings
"""

from __future__ import annotations

from pathlib import Path


# ==========================================================
# Site
# ==========================================================

SITE_NAME = "gmktec"

DISPLAY_NAME = "GMKtec"

BASE_URL = (
    "https://jp.gmktec.com/"
)


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
    "enabled": True,
    "provider": "a8",
    "a8mat": "4B9YL9+310D0I+5W12+BW0YB",
}


# ==========================================================
# Runtime Cache
# ==========================================================

BASE_DIR = (
    Path(__file__).resolve().parent
)

ROOT_TSV = (
    BASE_DIR / "root.tsv"
)

COLLECTIONS_TSV = (
    BASE_DIR / "collections.tsv"
)

LIST_TSV = (
    BASE_DIR / "list.tsv"
)

PRODUCT_LIST_TSV = (
    BASE_DIR / "product_list.tsv"
)