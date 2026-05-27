# ============================================================================
# SHIN SATELLITE OPS｜ITmedia Parser
# ============================================================================

import requests

from bs4 import BeautifulSoup


BLOCK_WORDS = [

    "関連記事",
    "関連リンク",
    "Copyright",
    "この記事に関連する",
    "広告",
    "PR",
    "ITmedia",
]


class ITmediaParser:

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

            body = (

                soup.find(
                    "div",
                    id="cmsBody",
                )

                or

                soup.find(
                    "div",
                    class_="article_body",
                )

                or

                soup.find(
                    "article",
                )
            )

            if not body:

                print(
                    "⚠ ITmedia body not found"
                )

                return ""

            # ================================================================
            # Remove Noise Blocks
            # ================================================================

            for tag in body.find_all([

                "script",
                "style",
                "aside",
                "noscript",
                "iframe",
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

                if ascii_ratio > 0.7:

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
                f"⚠ ITmedia Parser Error: {e}"
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
                f"⚠ ITmedia fetch_html Error: {e}"
            )

            return ""