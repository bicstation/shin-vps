# /home/maya/shin-vps/django/imports/tsukumo/scripts/settings.py

"""
TSUKUMO Importer Settings
"""

from pathlib import Path


# ==========================================================
# Site
# ==========================================================

SITE_NAME = "TSUKUMO"
BASE_URL = "https://www.tsukumo.co.jp"


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
    # True: アフィリエイトURLを生成する
    # False: Realityの商品URLをそのまま返す
    "enabled": True,

    # 将来利用する場合
    "provider": "valuecommerce",

    # SID / PID
    "sid": "3697471",
    "pid": "892665496",
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