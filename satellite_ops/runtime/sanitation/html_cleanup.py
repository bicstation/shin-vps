# ============================================================================
# SHIN SATELLITE OPS｜HTML Cleanup
# ============================================================================

from bs4 import BeautifulSoup


# ============================================================================
# Unwanted Tags
# ============================================================================

REMOVE_TAGS = [

    "script",
    "style",
    "noscript",
    "iframe",
    "svg",
    "form",
    "button",
    "nav",
    "footer",
    "aside",
]


# ============================================================================
# Cleanup HTML
# ============================================================================

def cleanup_html(
    html: str,
) -> str:
    """
    Lightweight HTML cleanup.
    """

    if not html:

        return ""

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    # ========================================================================
    # Remove Tags
    # ========================================================================

    for tag in REMOVE_TAGS:

        for element in soup.find_all(
            tag
        ):

            element.decompose()

    # ========================================================================
    # Remove Comments
    # ========================================================================

    for comment in soup.find_all(
        string=lambda text:
        isinstance(text, str)
        and
        "<!--" in text
    ):

        comment.extract()

    return str(soup)