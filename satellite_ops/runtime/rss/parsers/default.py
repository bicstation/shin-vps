# ============================================================================
# SHIN SATELLITE OPS｜Default RSS Parser
# ============================================================================

from satellite_ops.runtime.rss.parsers.base import (
    BaseParser,
)


# ============================================================================
# Default Parser
# ============================================================================

class DefaultParser(
    BaseParser
):
    """
    Generic article parser.

    Used for:

    - normal blogs
    - simple news sites
    - fallback runtime
    """

    # ========================================================================
    # Parse Article
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
        # Find Paragraphs
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