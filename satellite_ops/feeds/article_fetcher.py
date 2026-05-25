# ============================================================================
# SHIN SATELLITE OPS｜Article Fetcher
# ============================================================================

import requests
from bs4 import BeautifulSoup

BLOCK_WORDS = ["続きを読む","寄付","広告","スポンサー","PR","この記事の",]

def fetch_article_text(url):

    try:

        response = requests.get(
            url,
            timeout=10,
            headers={
                "User-Agent": (
                    "Mozilla/5.0"
                )
            }
        )

        soup = BeautifulSoup(
            response.text,
            "html.parser",
        )

        paragraphs = soup.find_all("p")
        text_parts = []

        for p in paragraphs[:10]:
            text = p.get_text(strip=True)
            
            if any(
                word in text
                for word in BLOCK_WORDS
                ):
                continue
            
            if len(text) < 20:
                continue

            text_parts.append(text)

        return "\n".join(text_parts)

    except Exception as e:

        print(
            f"⚠ Article Fetch Error: {e}"
        )

        return ""

