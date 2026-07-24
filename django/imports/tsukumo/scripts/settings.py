# /home/maya/shin-vps/django/imports/ark/scripts/settings.py

"""
ARK Importer Settings
"""

# ==========================================================
# Site
# ==========================================================

SITE_NAME = "ARK"
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
    # True: アフィリエイトURLを生成する
    # False: Realityの商品URLをそのまま返す
    "enabled": True,

    # 利用するASP
    "provider": "valuecommerce",

    # ValueCommerce SID / PID
    # ※ '&' は含めない
    "sid": "3697471",
    "pid": "892466351",
}

# ==========================================================
# Output
# ==========================================================

RAW_DIR = ...
PAYLOAD_DIR = ...
IMPORT_CONTRACT_DIR = ...