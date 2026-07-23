#!/usr/bin/env python3
"""
Affiliate URL Generator

Importer共通ライブラリ

役割:
    Realityの商品URLからアフィリエイトURLを生成する。

責務:
    - ASPごとのURL生成ロジック
    - ショップ固有設定は持たない

注意:
    - Importer専用ライブラリ
    - Backend依存なし
    - Django依存なし
"""

from urllib.parse import quote


# ==========================================================
# Affiliate Providers
# ==========================================================

PROVIDERS = {
    "valuecommerce": {
        "endpoint": "https://ck.jp.ap.valuecommerce.com/servlet/referral",
    },
    "a8": {
        "endpoint": "",
    },
    "amazon": {
        "endpoint": "",
    },
    "rakuten": {
        "endpoint": "",
    },
}


# ==========================================================
# Public API
# ==========================================================

def generate_affiliate_url(product_url: str, affiliate: dict) -> str:
    """
    商品URLからアフィリエイトURLを生成する。

    Parameters
    ----------
    product_url : str
        Realityの商品URL

    affiliate : dict
        settings.py の AFFILIATE 設定

    Returns
    -------
    str
        アフィリエイトURL
    """

    if not affiliate:
        return product_url

    if not affiliate.get("enabled", False):
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
    """
    ValueCommerce
    """

    endpoint = PROVIDERS["valuecommerce"]["endpoint"]

    sid = config.get("sid", "")
    pid = config.get("pid", "")

    if not sid or not pid:
        return url

    return (
        f"{endpoint}"
        f"?sid={sid}"
        f"&pid={pid}"
        f"&vc_url={quote(url, safe='')}"
    )


def _a8(url: str, config: dict) -> str:
    """
    A8.net
    """
    return url


def _amazon(url: str, config: dict) -> str:
    """
    Amazon Associates
    """
    return url


def _rakuten(url: str, config: dict) -> str:
    """
    楽天アフィリエイト
    """
    return url