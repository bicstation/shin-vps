"""
==============================================================================
FRONTIER Runtime Settings

Runtime Foundation

Reality First
==============================================================================
"""

from pathlib import Path


# ==========================================================
# Runtime
# ==========================================================

RUNTIME_VERSION = "v1"

ENCODING = "utf-8"

TSV_DELIMITER = "\t"


# ==========================================================
# Site
# ==========================================================

SITE_NAME = "FRONTIER"

BASE_URL = "https://www.frontier-direct.jp"


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
    "provider": "valuecommerce",
    "sid": "3697471",
    "pid": "892466517",
}


# ==========================================================
# Directory
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent

SCRAPING_DIR = BASE_DIR.parent

SOURCE_DIR = SCRAPING_DIR.parent


# ==========================================================
# Runtime Directory
# ==========================================================

RUNTIME_DIR = SOURCE_DIR / "runtime" / "frontier"

RUNTIME_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ==========================================================
# Runtime Seed
# ==========================================================

SEED_TSV = (
    RUNTIME_DIR
    / "seed.tsv"
)


# ==========================================================
# Runtime TSV
# ==========================================================

SERIES_LIST_TSV = (
    RUNTIME_DIR
    / "series_list.tsv"
)

MODEL_LIST_TSV = (
    RUNTIME_DIR
    / "model_list.tsv"
)

PRODUCT_LIST_TSV = (
    RUNTIME_DIR
    / "product_list.tsv"
)


# ==========================================================
# Runtime JSON
# ==========================================================

PAYLOAD_DIR = (
    RUNTIME_DIR
    / "payload"
)

PAYLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

IMPORT_CONTRACT_DIR = (
    RUNTIME_DIR
    / "import_contract"
)

IMPORT_CONTRACT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ==========================================================
# Payload
# ==========================================================

PRODUCTS_JSON = (
    PAYLOAD_DIR
    / "products.json"
)


# ==========================================================
# Import Contract
# ==========================================================

IMPORT_PRODUCTS_JSON = (
    IMPORT_CONTRACT_DIR
    / "products.json"
)