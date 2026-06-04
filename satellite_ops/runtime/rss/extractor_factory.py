# ============================================================================
# SHIN SATELLITE OPS｜Extractor Factory
# ============================================================================

from satellite_ops.runtime.rss.extractors.base import (
    BaseExtractor,
)

from satellite_ops.runtime.rss.extractors.news import (
    NewsExtractor,
)

from satellite_ops.runtime.rss.extractors.fanza import (
    FanzaExtractor,
)


# ============================================================================
# Get Extractor
# ============================================================================

def get_extractor(
    url: str,
    category: str = "",
):
    """
    Select image extractor by source.
    """

    target_url = (
        url or ""
    ).lower()

    target_category = (
        category or ""
    ).lower()

    # ========================================================================
    # FANZA / DMM
    # ========================================================================

    if (

        "dmm.co.jp" in target_url
        or
        "fanza" in target_url
    ):

        return FanzaExtractor

    # ========================================================================
    # News Sources
    # ========================================================================

    news_domains = [

        "yahoo.co.jp",
        "itmedia.co.jp",
        "ascii.jp",
        "impress.co.jp",
        "techcrunch.com",
        "phileweb.com",
    ]

    if any(

        domain in target_url

        for domain in news_domains
    ):

        return NewsExtractor

    # ========================================================================
    # Default
    # ========================================================================

    return BaseExtractor