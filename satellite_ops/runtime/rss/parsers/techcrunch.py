# ============================================================================
# SHIN SATELLITE OPS｜TechCrunch Parser
# ============================================================================

import requests

from bs4 import BeautifulSoup

BLOCK_WORDS = [

"StrictlyVC",
"Subscribe",
"Register",
"Upcoming event",
"Save up to",
"TechCrunch event",
"advertisement",


]

class TechCrunchParser:


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
                    class_="entry-content",
                )

                or

                soup.find(
                    "div",
                    class_="article-content",
                )

                or

                soup.find(
                    "div",
                    class_="wp-block-post-content",
                )

                or

                soup.find(
                    "article",
                )

            )

            if not body:

                print(
                    "⚠ TechCrunch body not found"
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

                    word.lower()
                    in text.lower()

                    for word in BLOCK_WORDS
                ):
                    continue

                # ------------------------------------------------------------
                # Too Short
                # ------------------------------------------------------------

                if len(text) < 40:
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
                f"⚠ TechCrunch Parser Error: {e}"
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
                f"⚠ TechCrunch fetch_html Error: {e}"
            )

            return ""

