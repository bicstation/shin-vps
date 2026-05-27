# ============================================================================
# SHIN SATELLITE OPS｜FANZA Image Extractor
# ============================================================================

import re

from satellite_ops.runtime.rss.extractors.base import (
    BaseExtractor,
)


# ============================================================================
# FANZA Extractor
# ============================================================================

class FanzaExtractor(
    BaseExtractor
):
    """
    FANZA / DMM image extractor.

    Responsibilities:

    - sample image extraction
    - lightweight high-quality normalization
    """

    # ========================================================================
    # Extract Image
    # ========================================================================

    @classmethod
    def extract(
        cls,
        html: str,
    ) -> str:

        image_url = super().extract(
            html
        )

        if not image_url:

            return ""

        # ====================================================================
        # High Quality Conversion
        # ====================================================================

        image_url = re.sub(

            r"p([stmb])\.jpg",

            "pl.jpg",

            image_url,
        )

        return image_url