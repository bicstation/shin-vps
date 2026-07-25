# /home/maya/shin-dev/shin-vps/django/imports/ozgaming/scripts/settings.py

"""
OZ GAMING Importer Settings
"""

from pathlib import Path


# ==========================================================
# Site
# ==========================================================

SITE_NAME = "OZ GAMING"

BASE_URL = "https://ozgaming-pcshop.com"


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

    # True : アフィリエイトURLを生成
    # False: Realityの商品URLをそのまま利用
    "enabled": True,

    # Affiliate Provider
    "provider": "a8",

    # A8 広告素材ID
    "a8mat": "4B88SU+B5C71E+5U1O+BW0YB",

}


# ==========================================================
# Output
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

OUTPUT_DIR = BASE_DIR / "output"

RAW_DIR = OUTPUT_DIR / "raw"
PAYLOAD_DIR = OUTPUT_DIR / "payload"
IMPORT_CONTRACT_DIR = OUTPUT_DIR / "import_contract"

RAW_DIR.mkdir(parents=True, exist_ok=True)
PAYLOAD_DIR.mkdir(parents=True, exist_ok=True)
IMPORT_CONTRACT_DIR.mkdir(parents=True, exist_ok=True)