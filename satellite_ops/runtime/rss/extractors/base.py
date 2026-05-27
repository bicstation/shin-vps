# ============================================================================
# SHIN SATELLITE OPS｜Base Image Extractor
# ============================================================================

import re


# ============================================================================
# Base Extractor
# ============================================================================

class BaseExtractor:
    """
    Base image extractor.

    Responsibilities:

    - generic image extraction
    - dummy rejection
    - lightweight normalization
    """

    BLOCK_KEYWORDS = [

        "dummy",
        "logo",
        "banner",
        "icon",
        "pixel",
        "ads",
        "noimage",
    ]

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

        candidates = re.findall(

            r'<img [^>]*src="([^"]+)"',

            html,
        )

        for candidate in candidates:

            target = candidate.lower()

            # ================================================================
            # Skip Noise Images
            # ================================================================

            if any(

                keyword in target

                for keyword in cls.BLOCK_KEYWORDS
            ):

                continue

            # ================================================================
            # Skip Preview Fragments
            # ================================================================

            if re.search(

                r'-\\d{1,2}\\.(jpg|jpeg|png|webp)$',

                target,
            ):

                continue

            return candidate.strip()

        return ""