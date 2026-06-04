# ============================================================================
# SHIN SATELLITE OPS｜News Image Extractor
# ============================================================================

from bs4 import BeautifulSoup

from satellite_ops.runtime.rss.extractors.base import (
    BaseExtractor,
)


# ============================================================================
# News Extractor
# ============================================================================

class NewsExtractor(
    BaseExtractor
):
    """
    News image extractor.

    Responsibilities:

    - og:image extraction
    - generic news fallback
    """

    # ========================================================================
    # Extract Image
    # ========================================================================

    @classmethod
    def extract(
        cls,
        html: str,
    ) -> str:

        if not html:

            return ""

        soup = BeautifulSoup(
            html,
            "html.parser",
        )

        # ====================================================================
        # OGP Image
        # ====================================================================

        og_image = soup.find(

            "meta",

            property="og:image",
        )

        if (

            og_image
            and
            og_image.get("content")
        ):

            return og_image.get(
                "content"
            ).strip()

        # ====================================================================
        # Fallback
        # ====================================================================

        return super().extract(
            html
        )