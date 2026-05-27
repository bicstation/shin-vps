# ============================================================================
# SHIN SATELLITE OPS｜Parser Factory
# ============================================================================

from satellite_ops.runtime.rss.parsers.default import ( DefaultParser,)
from satellite_ops.runtime.rss.parsers.yahoo import ( YahooParser,)
from satellite_ops.runtime.rss.parsers.fanza import ( FanzaParser,)
from satellite_ops.runtime.rss.parsers.itmedia import ( ITmediaParser,)
from satellite_ops.runtime.rss.parsers.impress import ( ImpressParser,)
from satellite_ops.runtime.rss.parsers.ascii import ( ASCIIParser,)

# ============================================================================
# Get Parser
# ============================================================================

def get_parser(
    url: str,
):
    """
    Select parser by source URL.
    """

    target = (
        url or ""
    ).lower()

    # ========================================================================
    # Yahoo
    # ========================================================================

    if "yahoo.co.jp" in target:

        return YahooParser

    # ========================================================================
    # ITmedia
    # ========================================================================

    if "itmedia.co.jp" in target:

        return ITmediaParser

    # ========================================================================
    # Impress / Watch
    # ========================================================================

    if (

        "impress.co.jp" in target

        or

        "watch.impress.co.jp" in target
    ):

        return ImpressParser

    # ========================================================================
    # ASCII
    # ========================================================================

    if "ascii.jp" in target:

        return ASCIIParser


    # # ========================================================================
    # # PhileWeb
    # # ========================================================================

    # if "phileweb.com" in target:

    #     return PhileWebParser

    # ========================================================================
    # FANZA / DMM
    # ========================================================================

    if (

        "dmm.co.jp" in target
        or
        "fanza" in target
    ):

        return FanzaParser

    # ========================================================================
    # Default
    # ========================================================================

    return DefaultParser