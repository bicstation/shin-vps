# ==============================================================================
#
# FILE:
# acquisition/sources/scraping/fujitsu/settings.py
#
# SHIN CORE LINX
#
# FUJITSU / FMV Runtime Settings
#
# Reality First
#
# ==============================================================================

from pathlib import Path


# ==============================================================================
# Runtime
# ==============================================================================

RUNTIME_VERSION = "v2"

SOURCE_NAME = "FUJITSU"

ENCODING = "utf-8"

TSV_DELIMITER = "\t"


# ==============================================================================
# Site
# ==============================================================================

SITE_NAME = "FUJITSU"

BASE_URL = (
    "https://www.fmv.com/"
)


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

# ------------------------------------------------------------------------------
# IMPORTANT
#
# Affiliate URLs are already provided by LinkShare / FTP.
#
# This Runtime does NOT generate or convert Affiliate URLs.
#
# Runtime responsibility:
#
#     Existing Affiliate URL
#             ↓
#       URL Resolver
#             ↓
#       FUJITSU / FMV Reality URL
#
# ------------------------------------------------------------------------------

AFFILIATE = {

    "enabled": False,

    "provider": "",

}


# ==============================================================================
# Directory
# ==============================================================================

BASE_DIR = (
    Path(__file__).resolve().parent
)

SCRAPING_DIR = (
    BASE_DIR.parent
)

SOURCE_DIR = (
    SCRAPING_DIR.parent
)


# ==============================================================================
# Reality
# ==============================================================================

SEED_TSV = (
    BASE_DIR
    / "seed.tsv"
)