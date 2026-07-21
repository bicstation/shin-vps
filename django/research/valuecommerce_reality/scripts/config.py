# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/config.py

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


# ---------------------------------------------------------
# Load .env
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


# ---------------------------------------------------------
# OAuth Credentials
# ---------------------------------------------------------

VALUECOMMERCE_CLIENT_KEY = os.getenv(
    "VALUECOMMERCE_CLIENT_KEY",
    "",
)

VALUECOMMERCE_CLIENT_SECRET = os.getenv(
    "VALUECOMMERCE_CLIENT_SECRET",
    "",
)


# ---------------------------------------------------------
# ProductDB Token
# ---------------------------------------------------------

VALUECOMMERCE_PRODUCTDB_TOKEN = os.getenv(
    "VALUECOMMERCE_PRODUCTDB_TOKEN",
    "",
)


# ---------------------------------------------------------
# OAuth
# ---------------------------------------------------------

VALUECOMMERCE_GRANT_TYPE = os.getenv(
    "VALUECOMMERCE_GRANT_TYPE",
    "client_credentials",
)


# ---------------------------------------------------------
# API URLs
# ---------------------------------------------------------

VALUECOMMERCE_AUTH_URL = os.getenv(
    "VALUECOMMERCE_AUTH_URL",
    "https://api.valuecommerce.com/auth/v1/affiliate/token/",
)

VALUECOMMERCE_PRODUCT_URL = os.getenv(
    "VALUECOMMERCE_PRODUCT_URL",
    "https://api.valuecommerce.com/product/v1/",
)

VALUECOMMERCE_PRODUCTDB_URL = os.getenv(
    "VALUECOMMERCE_PRODUCTDB_URL",
    "http://webservice.valuecommerce.ne.jp/productdb/search",
)


# ---------------------------------------------------------
# Default Observation
# ---------------------------------------------------------

VALUECOMMERCE_EC_CODE = os.getenv(
    "VALUECOMMERCE_EC_CODE",
    "bdu9t",
)

VALUECOMMERCE_ACCEPT = os.getenv(
    "VALUECOMMERCE_ACCEPT",
    "application/json",
)


# ---------------------------------------------------------
# Runtime
# ---------------------------------------------------------

VALUECOMMERCE_TIMEOUT = int(
    os.getenv(
        "VALUECOMMERCE_TIMEOUT",
        "30",
    )
)