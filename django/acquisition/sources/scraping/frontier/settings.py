"""
FRONTIER Runtime Settings
"""

from pathlib import Path


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
    # True: アフィリエイトURLを生成する
    # False: Realityの商品URLをそのまま返す
    "enabled": True,

    # 利用プロバイダ
    "provider": "valuecommerce",

    # FRONTIER (ValueCommerce)
    "sid": "3697471",
    "pid": "892466517",
}


# ==========================================================
# Runtime
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent

SOURCE_DIR = BASE_DIR.parent.parent

RUNTIME_DIR = SOURCE_DIR / "runtime" / "frontier"
RUNTIME_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ==========================================================
# Reality Seed
# ==========================================================

SEED_TSV = RUNTIME_DIR / "seed.tsv"


# ==========================================================
# Runtime TSV
# ==========================================================

MODEL_LIST_TSV = RUNTIME_DIR / "model_list.tsv"

SERIES_LIST_TSV = RUNTIME_DIR / "series_list.tsv"

PRODUCT_LIST_TSV = RUNTIME_DIR / "product_list.tsv"


# ==========================================================
# Runtime JSON
# ==========================================================

PAYLOAD_DIR = RUNTIME_DIR / "payload"
PAYLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

IMPORT_CONTRACT_DIR = RUNTIME_DIR / "import_contract"
IMPORT_CONTRACT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

PRODUCTS_JSON = (
    PAYLOAD_DIR
    / "products.json"
)

IMPORT_PRODUCTS_JSON = (
    IMPORT_CONTRACT_DIR
    / "products.json"
)