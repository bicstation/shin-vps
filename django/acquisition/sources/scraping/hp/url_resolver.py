#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/hp/url_resolver.py

SHIN CORE LINX

HP Manufacturer URL Resolver

Responsibility

    LinkShare Affiliate URL
            ↓
    Embedded Tracking URL
            ↓
    Manufacturer URL

Reality First

This Runtime does NOT:

- HTTP Fetch
- HTML Scraping
- Observation
- Semantic Mapping
- AI Processing
- PCProduct Persistence
==============================================================================
"""

from __future__ import annotations


from urllib.parse import (
    parse_qs,
    unquote,
    urlparse,
)


# ==============================================================================
# Constants
# ==============================================================================

HP_HOSTS = {
    "hp.com",
    "www.hp.com",
}


# ==============================================================================
# Internal Helpers
# ==============================================================================

def _is_hp_url(
    value: str,
) -> bool:
    """
    Check whether value is an HP manufacturer URL.
    """

    if not value:
        return False

    try:

        parsed = urlparse(
            value,
        )

    except Exception:

        return False

    host = (
        parsed.netloc
        .lower()
        .split(":")[0]
    )

    return (
        parsed.scheme in {
            "http",
            "https",
        }
        and (
            host in HP_HOSTS
            or host.endswith(
                ".hp.com",
            )
        )
    )


def _extract_hp_url(
    value: str,
) -> str | None:
    """
    Find an HP manufacturer URL embedded inside a string.

    Handles repeatedly URL-encoded values.

    Important:

    The resolved HP URL is preserved as-is.
    Manufacturer query parameters are not removed.
    """

    if not value:
        return None

    current = value.strip()

    # --------------------------------------------------------------------------
    # Direct URL
    # --------------------------------------------------------------------------

    if _is_hp_url(
        current,
    ):

        return current

    # --------------------------------------------------------------------------
    # Repeated URL decoding
    #
    # LinkShare / redirect URLs may contain multiple
    # encoded layers.
    # --------------------------------------------------------------------------

    for _ in range(6):

        decoded = unquote(
            current,
        )

        if decoded == current:
            break

        current = decoded

        if _is_hp_url(
            current,
        ):

            return current

    # --------------------------------------------------------------------------
    # Embedded HP URL
    #
    # Search for an HP URL inside a larger string.
    # --------------------------------------------------------------------------

    markers = (
        "https://www.hp.com/",
        "http://www.hp.com/",
        "https://hp.com/",
        "http://hp.com/",
        "https://jp.ext.hp.com/",
        "http://jp.ext.hp.com/",
    )

    for marker in markers:

        position = current.find(
            marker,
        )

        if position < 0:
            continue

        candidate = current[
            position:
        ]

        # ----------------------------------------------------------------------
        # Remove delimiters introduced by an outer wrapper.
        #
        # Do NOT split on "&" because "&" may belong to the
        # HP manufacturer's own query string.
        # ----------------------------------------------------------------------

        for delimiter in (
            '"',
            "'",
            " ",
            ")",
            ">",
        ):

            candidate = candidate.split(
                delimiter,
                1,
            )[0]

        if _is_hp_url(
            candidate,
        ):

            return candidate

    return None


# ==============================================================================
# Public Resolver
# ==============================================================================

def resolve_manufacturer_url(
    affiliate_url: str,
) -> str | None:
    """
    Resolve an HP manufacturer URL from an affiliate URL.

    Parameters
    ----------
    affiliate_url:
        Existing PCProduct affiliate URL.

    Returns
    -------
    str | None
        Resolved HP manufacturer URL.
    """

    if not affiliate_url:
        return None

    value = affiliate_url.strip()

    if not value:
        return None

    # --------------------------------------------------------------------------
    # 1. Direct HP URL
    # --------------------------------------------------------------------------

    if _is_hp_url(
        value,
    ):

        return value

    # --------------------------------------------------------------------------
    # 2. Parse outer query parameters
    # --------------------------------------------------------------------------

    try:

        parsed = urlparse(
            value,
        )

        query = parse_qs(
            parsed.query,
            keep_blank_values=True,
        )

    except Exception:

        query = {}

    # --------------------------------------------------------------------------
    # 3. Check known redirect parameters
    #
    # Current HP LinkShare data uses murl.
    # --------------------------------------------------------------------------

    for key in (
        "murl",
        "url",
        "u",
        "redirect",
        "redirect_url",
        "destination",
        "dest",
        "target",
    ):

        values = query.get(
            key,
            [],
        )

        for candidate in values:

            resolved = _extract_hp_url(
                candidate,
            )

            if resolved:

                return resolved

    # --------------------------------------------------------------------------
    # 4. Fallback
    #
    # Inspect the entire affiliate URL.
    # --------------------------------------------------------------------------

    return _extract_hp_url(
        value,
    )


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    print(
        "HP URL RESOLVER"
    )