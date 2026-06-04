# ============================================================================
# SHIN SATELLITE OPS｜FANZA Parser
# ============================================================================

import requests

from satellite_ops.runtime.rss.parsers.base import (
    BaseParser,
)


# ============================================================================
# FANZA Parser
# ============================================================================

class FanzaParser(
    BaseParser
):
    """
    FANZA / DMM parser.

    Responsibilities:

    - adult cookie runtime
    - lightweight extraction
    """

    HEADERS = {

        "User-Agent": (
            "Mozilla/5.0"
        )
    }

    COOKIES = {

        "age_check_done": "1",
    }

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

                cookies=cls.COOKIES,

                timeout=10,
            )

            response.raise_for_status()

            return response.text

        except Exception as e:

            print(
                f"⚠ FANZA Fetch Error: {e}"
            )

            return ""

    # ========================================================================
    # Parse
    # ========================================================================

    @classmethod
    def parse(
        cls,
        url: str,
    ) -> str:

        html = cls.fetch_html(
            url
        )

        if not html:

            return ""

        soup = cls.build_soup(
            html
        )

        soup = cls.cleanup_soup(
            soup
        )

        paragraphs = soup.find_all(
            "p"
        )

        text_parts = []

        for p in paragraphs[:15]:

            text = p.get_text(
                strip=True
            )

            if len(text) < 20:

                continue

            text_parts.append(
                text
            )

        return "\n".join(
            text_parts
        )