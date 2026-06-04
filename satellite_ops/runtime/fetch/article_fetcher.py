# ============================================================================
# SHIN SATELLITE OPS｜Article Fetcher
# ============================================================================

import requests

from bs4 import BeautifulSoup


# ============================================================================
# Runtime Config
# ============================================================================

HEADERS = {

    "User-Agent": (
        "Mozilla/5.0"
    )
}

BLOCK_WORDS = [

    "続きを読む",
    "寄付",
    "広告",
    "スポンサー",
    "PR",
    "この記事の",
]


# ============================================================================
# Fetch Raw Article HTML
# ============================================================================

def fetch_article_html(
    url: str,
) -> str:
    """
    Fetch raw article HTML.

    Used for:
    - image extraction
    - og:image
    - future metadata extraction
    """

    try:

        response = requests.get(
            url,
            timeout=10,
            headers=HEADERS,
        )

        response.raise_for_status()

        return response.text

    except Exception as e:

        print(
            f"⚠ Article HTML Fetch Error: {e}"
        )

        return ""


# ============================================================================
# Fetch Article Text
# ============================================================================

def fetch_article_text(
    url: str,
) -> str:
    """
    Fetch lightweight readable article text.
    """

    try:

        html = fetch_article_html(
            url
        )

        if not html:

            return ""

        soup = BeautifulSoup(
            html,
            "html.parser",
        )

        paragraphs = soup.find_all("p")

        text_parts = []

        for p in paragraphs[:10]:

            text = p.get_text(
                strip=True
            )

            # ================================================================
            # Block Noise
            # ================================================================

            if any(

                word in text

                for word in BLOCK_WORDS
            ):

                continue

            # ================================================================
            # Skip Tiny Lines
            # ================================================================

            if len(text) < 20:

                continue

            text_parts.append(
                text
            )

        return "\n".join(
            text_parts
        )

    except Exception as e:

        print(
            f"⚠ Article Fetch Error: {e}"
        )

        return ""