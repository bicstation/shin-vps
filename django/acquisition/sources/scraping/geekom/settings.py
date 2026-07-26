"""
GEEKOM Importer Settings
"""

from pathlib import Path


# ==========================================================
# Site
# ==========================================================

SITE_NAME = "GEEKOM"
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
# Runtime
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


# ==========================================================
# Runtime Output
# ==========================================================

OUTPUT_DIR = BASE_DIR / "output"

#
# Acquire
#

RAW_DIR = OUTPUT_DIR / "raw"
PRODUCT_RAW_DIR = RAW_DIR / "products"

#
# Formatter
#

FORMATTED_DIR = OUTPUT_DIR / "formatted"

#
# Observation
#

OBSERVATION_DIR = OUTPUT_DIR / "observation"

#
# Integration
#

PAYLOAD_DIR = OUTPUT_DIR / "payload"
IMPORT_CONTRACT_DIR = OUTPUT_DIR / "import_contract"


# ==========================================================
# Create Directories
# ==========================================================

for directory in (
    RAW_DIR,
    PRODUCT_RAW_DIR,
    FORMATTED_DIR,
    OBSERVATION_DIR,
    PAYLOAD_DIR,
    IMPORT_CONTRACT_DIR,
):
    directory.mkdir(
        parents=True,
        exist_ok=True,
    )