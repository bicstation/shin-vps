#!/usr/bin/env python3

import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

load_dotenv(ROOT_DIR / ".env")

CREDENTIAL_ID = os.getenv("AMAZON_CREDENTIAL_ID")
CREDENTIAL_SECRET = os.getenv("AMAZON_CREDENTIAL_SECRET")
VERSION = os.getenv("AMAZON_VERSION")

PARTNER_TAG = os.getenv("AMAZON_PARTNER_TAG")
MARKETPLACE = os.getenv(
    "AMAZON_MARKETPLACE",
    "www.amazon.co.jp",
)


import sys

sys.path.insert(
    0,
    "/usr/src/app/research/amazon_reality/sdk/creatorsapi-python-sdk"
)

import creatorsapi_python_sdk

print("SDK OK")
print(creatorsapi_python_sdk.__file__)


from creatorsapi_python_sdk.api_client import ApiClient
from creatorsapi_python_sdk.api.default_api import DefaultApi
from creatorsapi_python_sdk.models.get_items_request_content import (
    GetItemsRequestContent,
)

print("Import OK")

api_client = ApiClient(
    credential_id=CREDENTIAL_ID,
    credential_secret=CREDENTIAL_SECRET,
    version=VERSION,
)

print("ApiClient OK")

api = DefaultApi(api_client)

print("DefaultApi OK")


request = GetItemsRequestContent(
    partner_tag=PARTNER_TAG,
    item_ids=["B092D5BYY2"],
    resources=[
        "itemInfo.title",
    ],
)

response = api.get_items(
    x_marketplace=MARKETPLACE,
    get_items_request_content=request,
)

print(response)


