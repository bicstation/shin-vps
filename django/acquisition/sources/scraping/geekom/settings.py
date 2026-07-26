"""
GEEKOM Importer Settings
"""

from pathlib import Path

# ==========================================================
# Site
# ==========================================================

SITE_NAME = "geekom"
DISPLAY_NAME = "GEEKOM"
BASE_URL = "https://geekom.jp"

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
    "a8mat": "459XR1+CCSU76+5G4A+BW0YB",
}

# ==========================================================
# Runtime Cache
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent

RUNTIME_DIR = (
    BASE_DIR.parent.parent
    / "runtime"
    / SITE_NAME.lower()
)

ROOT_TSV = RUNTIME_DIR / "root.tsv"
COLLECTIONS_TSV = RUNTIME_DIR / "collections.tsv"
LIST_TSV = RUNTIME_DIR / "list.tsv"
PRODUCT_LIST_TSV = RUNTIME_DIR / "product_list.tsv"