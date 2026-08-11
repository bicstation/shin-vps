#!/usr/bin/env python3

# ==============================================================================
#
# FILE:
# /home/maya/shin-dev/shin-vps/django/acquisition/common/affiliate/affiliate.py
#
# SHIN CORE LINX
#
# Affiliate URL Generator
#
# Importer Common Library
#
# Responsibilities
#
# - Reality URL → Affiliate URL
# - ASP-specific generation logic only
# - Shop-specific configuration is delegated to settings.py
#
# NOT Responsibilities
#
# - Product acquisition
# - HTTP
# - HTML parsing
# - Observation
# - Product mapping
# - Product definition
#
# ==============================================================================

from __future__ import annotations

from urllib.parse import quote


# ==============================================================================
# Providers
# ==============================================================================

PROVIDERS = {

    # --------------------------------------------------------------------------
    # ValueCommerce
    # --------------------------------------------------------------------------

    "valuecommerce":
        "https://ck.jp.ap.valuecommerce.com/servlet/referral",

    # --------------------------------------------------------------------------
    # A8
    # --------------------------------------------------------------------------

    "a8":
        "https://px.a8.net/svt/ejp",

    # --------------------------------------------------------------------------
    # LinkShare
    # --------------------------------------------------------------------------

    "linkshare":
        "https://click.linksynergy.com/deeplink",

    # --------------------------------------------------------------------------
    # Other
    # --------------------------------------------------------------------------

    "amazon": "",

    "rakuten": "",

}


# ==============================================================================
# Public API
# ==============================================================================

def generate_affiliate_url(
    product_url: str,
    affiliate: dict,
) -> str:
    """
    Generate Affiliate URL from Reality product URL.

    Parameters
    ----------
    product_url:
        Official Reality product URL.

    affiliate:
        Provider-specific configuration.

    Returns
    -------
    str
        Affiliate URL.

    Runtime Principle
    -----------------
    If Affiliate configuration is unavailable or incomplete,
    the original Reality URL is returned unchanged.
    """

    if (
        not affiliate
        or not affiliate.get("enabled")
    ):

        return product_url


    provider = affiliate.get(
        "provider",
    )


    # --------------------------------------------------------------------------
    # ValueCommerce
    # --------------------------------------------------------------------------

    if provider == "valuecommerce":

        return _valuecommerce(
            product_url,
            affiliate,
        )


    # --------------------------------------------------------------------------
    # A8
    # --------------------------------------------------------------------------

    if provider == "a8":

        return _a8(
            product_url,
            affiliate,
        )


    # --------------------------------------------------------------------------
    # LinkShare
    # --------------------------------------------------------------------------

    if provider == "linkshare":

        return _linkshare(
            product_url,
            affiliate,
        )


    # --------------------------------------------------------------------------
    # Amazon
    # --------------------------------------------------------------------------

    if provider == "amazon":

        return _amazon(
            product_url,
            affiliate,
        )


    # --------------------------------------------------------------------------
    # Rakuten
    # --------------------------------------------------------------------------

    if provider == "rakuten":

        return _rakuten(
            product_url,
            affiliate,
        )


    # --------------------------------------------------------------------------
    # Unknown Provider
    # --------------------------------------------------------------------------

    return product_url


# ==============================================================================
# ValueCommerce
# ==============================================================================

def _valuecommerce(
    url: str,
    config: dict,
) -> str:

    sid = config.get(
        "sid",
    )

    pid = config.get(
        "pid",
    )


    if not sid or not pid:

        return url


    return (
        f"{PROVIDERS['valuecommerce']}"
        f"?sid={sid}"
        f"&pid={pid}"
        f"&vc_url={quote(url, safe='')}"
    )


# ==============================================================================
# A8
# ==============================================================================

def _a8(
    url: str,
    config: dict,
) -> str:

    a8mat = config.get(
        "a8mat",
    )


    if not a8mat:

        return url


    return (
        f"{PROVIDERS['a8']}"
        f"?a8mat={a8mat}"
        f"&a8ejpredirect={quote(url, safe='')}"
    )


# ==============================================================================
# LinkShare
# ==============================================================================

def _linkshare(
    url: str,
    config: dict,
) -> str:
    """
    Generate LinkShare Deeplink URL.

    Configuration
    -------------
    id:
        LinkShare publisher / affiliate identifier.

    mid:
        LinkShare advertiser / merchant ID.

    murl:
        Official Reality URL.

    Example
    -------
    https://click.linksynergy.com/deeplink
        ?id=nNBA6GzaGrQ
        &mid=35909
        &murl=<encoded-product-url>
    """

    affiliate_id = config.get(
        "id",
        "",
    )

    mid = config.get(
        "mid",
        "",
    )


    if not affiliate_id or not mid:

        return url


    return (
        f"{PROVIDERS['linkshare']}"
        f"?id={affiliate_id}"
        f"&mid={mid}"
        f"&murl={quote(url, safe='')}"
    )


# ==============================================================================
# Amazon
# ==============================================================================

def _amazon(
    url: str,
    config: dict,
) -> str:

    return url


# ==============================================================================
# Rakuten
# ==============================================================================

def _rakuten(
    url: str,
    config: dict,
) -> str:

    return url