# ============================================================================
# SHIN SATELLITE OPS｜Base RSS Parser
# ============================================================================

import requests

from bs4 import BeautifulSoup


# ============================================================================
# Base Parser
# ============================================================================

class BaseParser:
    """
    Base RSS parser.

    Responsibility:

    - fetch article html
    - build soup
    - lightweight cleanup
    """

    HEADERS = {

        "User-Agent": (
            "Mozilla/5.0"
        )
    }

    TIMEOUT = 10

    # ========================================================================
    # Fetch HTML
    # ========================================================================

    @classmethod
    def fetch_html(
        cls,
        url: str,
    ) -> str:

        try:

            response = requests.get(

                url,

                headers=cls.HEADERS,

                timeout=cls.TIMEOUT,
            )

            response.raise_for_status()

            return response.text

        except Exception as e:

            print(
                f"⚠ Parser Fetch Error: {e}"
            )

            return ""

    # ========================================================================
    # Build Soup
    # ========================================================================

    @classmethod
    def build_soup(
        cls,
        html: str,
    ) -> BeautifulSoup:

        return BeautifulSoup(
            html,
            "html.parser",
        )

    # ========================================================================
    # Remove Unwanted Tags
    # ========================================================================

    @classmethod
    def cleanup_soup(
        cls,
        soup: BeautifulSoup,
    ) -> BeautifulSoup:

        unwanted_tags = [

            "script",
            "style",
            "noscript",
            "iframe",
            "nav",
            "footer",
        ]

        for tag in unwanted_tags:

            for element in soup.find_all(
                tag
            ):

                element.decompose()

        return soup