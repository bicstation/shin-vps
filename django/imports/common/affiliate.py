#!/usr/bin/env python3
"""
Affiliate URL Generator

Importer共通ライブラリ

Responsibility
--------------
- Reality URL → Affiliate URL
- ASPごとの生成ロジックのみを担当
- ショップ固有設定は settings.py に委譲
"""

from urllib.parse import quote


# ==========================================================
# Providers
# ==========================================================

PROVIDERS = {
    "valuecommerce": "https://ck.jp.ap.valuecommerce.com/servlet/referral",
    "a8": "https://px.a8.net/svt/ejp",
    "amazon": "",
    "rakuten": "",
}


# ==========================================================
# Public API
# ==========================================================

def generate_affiliate_url(product_url: str, affiliate: dict) -> str:

    if (
        not affiliate
        or not affiliate.get("enabled")
    ):
        return product_url

    provider = affiliate.get("provider")

    if provider == "valuecommerce":
        return _valuecommerce(product_url, affiliate)

    if provider == "a8":
        return _a8(product_url, affiliate)

    if provider == "amazon":
        return _amazon(product_url, affiliate)

    if provider == "rakuten":
        return _rakuten(product_url, affiliate)

    return product_url


# ==========================================================
# Providers
# ==========================================================

def _valuecommerce(url: str, config: dict) -> str:

    sid = config.get("sid")
    pid = config.get("pid")

    if not sid or not pid:
        return url

    return (
        f"{PROVIDERS['valuecommerce']}"
        f"?sid={sid}"
        f"&pid={pid}"
        f"&vc_url={quote(url, safe='')}"
    )


def _a8(url: str, config: dict) -> str:

    a8mat = config.get("a8mat")

    if not a8mat:
        return url

    return (
        f"{PROVIDERS['a8']}"
        f"?a8mat={a8mat}"
        f"&a8ejpredirect={quote(url, safe='')}"
    )


def _amazon(url: str, config: dict) -> str:
    return url


def _rakuten(url: str, config: dict) -> str:
    return url