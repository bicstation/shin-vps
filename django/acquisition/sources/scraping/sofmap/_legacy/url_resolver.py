# /home/maya/shin-dev/shin-vps/django/acquisition/sources/scraping/dell/url_resolver.py
# ==============================================================================
#
# FILE:
# acquisition/sources/scraping/dell/url_resolver.py
#
# SHIN CORE LINX
#
# DELL Manufacturer URL Resolver
#
# Responsibility
#
#   LinkShare Affiliate URL
#       ↓
#   Embedded Tracking URL
#       ↓
#   Manufacturer URL
#
# Reality First
#
# This Runtime does NOT:
#
#   - HTTP Fetch
#   - HTML Scraping
#   - Observation
#   - Semantic Mapping
#   - AI Processing
#   - PCProduct Persistence
#
# ==============================================================================

from __future__ import annotations

from urllib.parse import (
    parse_qs,
    unquote,
    urlparse,
)


# ==============================================================================
# Constants
# ==============================================================================

DELL_HOSTS = {
    "dell.com",
    "www.dell.com",
}


# ==============================================================================
# Internal Helpers
# ==============================================================================

def _is_dell_url(
    value: str,
) -> bool:
    """
    Check whether value is a DELL manufacturer URL.
    """

    try:
        parsed = urlparse(value)

    except Exception:
        return False

    host = (
        parsed.netloc
        .lower()
        .split(":")[0]
    )

    return (
        parsed.scheme in {"http", "https"}
        and (
            host in DELL_HOSTS
            or host.endswith(".dell.com")
        )
    )


def _extract_dell_url(
    value: str,
) -> str | None:
    """
    Find a DELL URL embedded inside a string.

    Handles repeatedly URL-encoded values.
    """

    current = value

    # --------------------------------------------------------------------------
    # Direct URL
    # --------------------------------------------------------------------------

    if _is_dell_url(current):
        return current

    # --------------------------------------------------------------------------
    # Repeated URL decoding
    #
    # LinkShare / DoubleClick URLs may contain multiple encoded layers.
    # --------------------------------------------------------------------------

    for _ in range(6):

        decoded = unquote(current)

        if decoded == current:
            break

        current = decoded

        if _is_dell_url(current):
            return current

    # --------------------------------------------------------------------------
    # Search for embedded https://www.dell.com/
    #
    # This is intentionally simple.
    # We are resolving Reality URL, not validating arbitrary URLs.
    # --------------------------------------------------------------------------

    markers = (
        "https://www.dell.com/",
        "http://www.dell.com/",
        "https://dell.com/",
        "http://dell.com/",
    )

    for marker in markers:

        position = current.find(marker)

        if position < 0:
            continue

        candidate = current[position:]

        # Remove common URL delimiters introduced by outer parameters.
        candidate = candidate.split(
            '"',
            1,
        )[0]

        candidate = candidate.split(
            "'",
            1,
        )[0]

        candidate = candidate.split(
            "&",
            1,
        )[0]

        candidate = candidate.split(
            " ",
            1,
        )[0]

        if _is_dell_url(candidate):
            return candidate

    return None


# ==============================================================================
# Public Resolver
# ==============================================================================

def resolve_manufacturer_url(
    affiliate_url: str,
) -> str | None:
    """
    Resolve a DELL manufacturer URL from an affiliate URL.

    Parameters
    ----------
    affiliate_url:
        Existing PCProduct affiliate URL.

    Returns
    -------
    str | None
        Resolved DELL manufacturer URL.
    """

    if not affiliate_url:
        return None

    value = affiliate_url.strip()

    if not value:
        return None

    # --------------------------------------------------------------------------
    # 1. Direct DELL URL
    # --------------------------------------------------------------------------

    if _is_dell_url(value):
        return value

    # --------------------------------------------------------------------------
    # 2. Parse outer query parameters
    # --------------------------------------------------------------------------

    try:

        parsed = urlparse(value)

        query = parse_qs(
            parsed.query,
            keep_blank_values=True,
        )

    except Exception:
        query = {}

    # --------------------------------------------------------------------------
    # 3. Check known redirect parameters
    #
    # Current DELL LinkShare data uses murl.
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

        values = query.get(key, [])

        for candidate in values:

            resolved = _extract_dell_url(
                candidate,
            )

            if resolved:
                return resolved

    # --------------------------------------------------------------------------
    # 4. Fallback: inspect entire affiliate URL
    # --------------------------------------------------------------------------

    return _extract_dell_url(
        value,
    )


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    print(
        "DELL URL RESOLVER"
    )