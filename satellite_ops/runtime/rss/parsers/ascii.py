# ============================================================================
# SHIN SATELLITE OPS｜ASCII Parser
# ============================================================================
# Purpose:
# Lightweight ASCII.jp parser
# ============================================================================
# Notes:
# - noisy RSS ecosystem
# - PR / ranking / club noise suppression
# - lightweight repost continuity
# ============================================================================

import requests

from bs4 import BeautifulSoup


# ============================================================================
# Noise Words
# ============================================================================

BLOCK_WORDS = [

    "関連記事",
    "関連リンク",
    "広告",
    "PR",
    "Sponsored",
    "ASCII倶楽部",
    "ランキング",
    "この記事をシェア",
    "おすすめ記事",
    "キャンペーン",
]


# ============================================================================
# ASCII Parser
# ============================================================================

class ASCIIParser:

    # ========================================================================
    # Parse
    # ========================================================================

    @classmethod
    def parse(
        cls,
        url,
    ):

        try:

            response = requests.get(

                url,

                timeout=10,

                headers={
                    "User-Agent": "Mozilla/5.0",
                }
            )

            # ================================================================
            # Encoding Stabilization
            # ================================================================

            response.encoding = (
                response.apparent_encoding
            )

            soup = BeautifulSoup(

                response.text,

                "html.parser",
            )

            # ================================================================
            # Main Body Detection
            # ================================================================

            # print("\n🧪 ASCII HTML Preview\n")

            # print(
            #     # soup.prettify()[:3000]
            #     soup.prettify()[15000:32000]
            # )
            print("\n🧪 FIND TEST\n")

            print(
                soup.find(
                    "div",
                    id="contents_detail",
                )
            )
            
            body = (

                soup.find(
                    "div",
                    id="contents_detail",
                )

                or

                soup.find(
                    "div",
                    class_="article-body",
                )

                or

                soup.find(
                    "div",
                    id="article-body",
                )

                or

                soup.find(
                    "div",
                    class_="article",
                )

                or

                soup.find(
                    "article",
                )
            )


            # ================================================================
            # Validation
            # ================================================================

            if not body:

                print(
                    "⚠ ASCII body not found"
                )

                return ""

            # ================================================================
            # Remove Noise Tags
            # ================================================================

            for tag in body.find_all([

                "script",
                "style",
                "aside",
                "noscript",
                "iframe",
                "figure",
            ]):

                tag.decompose()

            # ================================================================
            # Paragraph Extraction
            # ================================================================

            paragraphs = body.find_all("p")

            text_parts = []

            for p in paragraphs:

                text = p.get_text(

                    separator=" ",

                    strip=True,
                )

                # ------------------------------------------------------------
                # Empty
                # ------------------------------------------------------------

                if not text:
                    continue

                # ------------------------------------------------------------
                # Noise Filter
                # ------------------------------------------------------------

                if any(

                    word in text

                    for word in BLOCK_WORDS
                ):

                    continue

                # ------------------------------------------------------------
                # Too Short
                # ------------------------------------------------------------

                if len(text) < 30:

                    continue

                # ------------------------------------------------------------
                # English Heavy Skip
                # ------------------------------------------------------------

                ascii_ratio = (

                    sum(
                        1 for c in text
                        if ord(c) < 128
                    )

                    / max(len(text), 1)
                )

                if ascii_ratio > 0.75:

                    continue

                # ------------------------------------------------------------
                # Duplicate Suppression
                # ------------------------------------------------------------

                if text in text_parts:

                    continue

                text_parts.append(text)

            # ================================================================
            # Final Join
            # ================================================================

            return "\n".join(
                text_parts
            )

        except Exception as e:

            print(
                f"⚠ ASCII Parser Error: {e}"
            )

            return ""

    # ========================================================================
    # Fetch HTML
    # ========================================================================

    @classmethod
    def fetch_html(
        cls,
        url,
    ):

        try:

            response = requests.get(

                url,

                timeout=10,

                headers={
                    "User-Agent": "Mozilla/5.0",
                }
            )

            response.encoding = (
                response.apparent_encoding
            )

            return response.text

        except Exception as e:

            print(
                f"⚠ ASCII fetch_html Error: {e}"
            )

            return ""