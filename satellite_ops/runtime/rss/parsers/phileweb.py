# ============================================================================
# SHIN SATELLITE OPS｜PhileWeb Parser
# ============================================================================

import requests
from bs4 import BeautifulSoup

class PhileWebParser:


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
            # Encoding Normalize
            # ================================================================

            response.encoding = "cp932"

            soup = BeautifulSoup(

                response.text,

                "html.parser",
            )

            # ================================================================
            # Main Body
            # ================================================================

            body = (

                soup.find(
                    "div",
                    class_="p-article__body",
                )

                or

                soup.find(
                    "div",
                    class_="article-body",
                )

                or

                soup.find(
                    "article",
                )
            )

            if not body:

                print(
                    "⚠ PhileWeb body not found"
                )

                return ""

            # ================================================================
            # Remove Noise
            # ================================================================

            for tag in body.find_all([

                "script",
                "style",
                "aside",
                "iframe",
                "noscript",

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
                # Too Short
                # ------------------------------------------------------------

                if len(text) < 20:
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
                f"⚠ PhileWeb Parser Error: {e}"
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

            # ================================================================
            # Encoding Normalize
            # ================================================================

            response.encoding = "cp932"

            return response.text

        except Exception as e:

            print(
                f"⚠ PhileWeb fetch_html Error: {e}"
            )

            return ""

