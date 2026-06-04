# ============================================================================
# SHIN SATELLITE OPS｜Yahoo Parser
# ============================================================================

from satellite_ops.runtime.rss.parsers.base import (
    BaseParser,
)


# ============================================================================
# Yahoo Parser
# ============================================================================

class YahooParser(
    BaseParser
):
    """
    Yahoo article parser.

    Responsibilities:

    - Yahoo pickup breakthrough
    - lightweight article extraction
    """

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

        # ====================================================================
        # Pickup Page Handling
        # ====================================================================

        article_link = soup.find(
            "a",
            href=True,
        )

        if article_link:

            href = article_link.get(
                "href",
                ""
            )

            if (
                href.startswith("http")
                and
                "yahoo.co.jp" not in href
            ):

                html = cls.fetch_html(
                    href
                )

                if html:

                    soup = cls.build_soup(
                        html
                    )

                    soup = cls.cleanup_soup(
                        soup
                    )

        # ====================================================================
        # Extract Paragraphs
        # ====================================================================

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