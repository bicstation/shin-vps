#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/linkshare/api/client.py

SHIN CORE LINX
LinkShare API Client

Responsibilities

- OAuth2 Authentication
- Access Token Management
- HTTP Communication
- Receive Raw XML Reality

NOT

- Acquire
- AcquisitionDocument
- XML Parsing
- Observation
- Formatter
- Mapping
- Integration
- Database
- PCProduct
==============================================================================
"""

from __future__ import annotations

import base64
import time
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urljoin

import requests

from ..settings import (
    API_ACCOUNT_ID,
    API_BASE_URL,
    API_CLIENT_ID,
    API_CLIENT_SECRET,
    API_DEFAULT_MAX_PAGES,
    API_DEFAULT_PAGE_SIZE,
    API_REQUEST_INTERVAL,
    API_TIMEOUT,
)


class LinkShareAPIClient:
    """
    LinkShare API Client

    OAuth2
        ↓
    HTTP
        ↓
    Raw XML
    """

    def __init__(self) -> None:

        self.token_url = urljoin(
            API_BASE_URL,
            "token",
        )

        self.product_search_url = urljoin(
            API_BASE_URL,
            "productsearch/1.0",
        )

        self.access_token: str | None = None
        self.token_expiry_time: datetime | None = None

    # ==========================================================
    # OAuth2
    # ==========================================================

    def _generate_token_key(self) -> str:

        auth = f"{API_CLIENT_ID}:{API_CLIENT_SECRET}"

        return base64.b64encode(
            auth.encode("utf-8"),
        ).decode("utf-8")

    def _token_expired(
        self,
        buffer_seconds: int = 60,
    ) -> bool:

        if (
            self.access_token is None
            or self.token_expiry_time is None
        ):
            return True

        return (
            datetime.now(timezone.utc)
            >= self.token_expiry_time
            - timedelta(seconds=buffer_seconds)
        )

    def authenticate(self) -> str:

        if not self._token_expired():
            return self.access_token  # type: ignore

        response = requests.post(
            self.token_url,
            headers={
                "Authorization": f"Bearer {self._generate_token_key()}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={
                "grant_type": "password",
                "scope": API_ACCOUNT_ID,
            },
            timeout=API_TIMEOUT,
        )

        response.raise_for_status()

        payload = response.json()

        self.access_token = payload["access_token"]

        expires = int(
            payload.get(
                "expires_in",
                3600,
            )
        )

        self.token_expiry_time = (
            datetime.now(timezone.utc)
            + timedelta(seconds=expires)
        )

        return self.access_token

    # ==========================================================
    # Header
    # ==========================================================

    def build_headers(self) -> dict[str, str]:

        return {
            "Authorization": f"Bearer {self.authenticate()}",
        }

    # ==========================================================
    # Request
    # ==========================================================

    def request(
        self,
        *,
        params: dict[str, Any],
    ) -> dict[str, Any] | None:

        response = requests.get(
            self.product_search_url,
            headers=self.build_headers(),
            params=params,
            timeout=API_TIMEOUT,
        )

        #
        # LinkShare Page End
        #

        if response.status_code == 400:
            return None

        response.raise_for_status()

        return {

            "url": response.request.url,

            "content_type": response.headers.get(
                "Content-Type",
                "application/xml",
            ),

            "content": response.text,

        }

    # ==========================================================
    # Search Products
    # ==========================================================

    def search_products(
        self,
        *,
        mid: str,
        keyword: str | None = None,
        category: str | None = None,
        page_size: int = API_DEFAULT_PAGE_SIZE,
        max_pages: int = API_DEFAULT_MAX_PAGES,
    ) -> list[dict[str, Any]]:

        pages: list[dict[str, Any]] = []

        page = 1

        while True:

            result = self.request(

                params={

                    "mid": mid,

                    "keyword": keyword,

                    "cat": category,

                    "max": min(
                        page_size,
                        100,
                    ),

                    "pagenumber": page,

                },

            )

            #
            # End of Pages
            #

            if result is None:
                break

            pages.append(result)

            if max_pages and page >= max_pages:
                break

            page += 1

            time.sleep(
                API_REQUEST_INTERVAL,
            )

        return pages
    
    # ==========================================================
    # Search Advertisers
    # ==========================================================

    def search_advertisers(
        self,
        *,
        merchant_name: str | None = None,
    ) -> str:

        params: dict[str, str] = {}

        if merchant_name:

            params["merchantname"] = merchant_name

        headers = self.build_headers()

        headers["Accept"] = "application/xml"

        response = requests.get(

            urljoin(

                API_BASE_URL,

                "advertisersearch/1.0",

            ),

            headers=headers,

            params=params,

            timeout=API_TIMEOUT,

        )

        response.raise_for_status()

        return response.text