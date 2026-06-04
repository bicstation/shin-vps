# ============================================================================
# SHIN SATELLITE OPS｜Gizmodo Parser
# ============================================================================

import requests

from bs4 import BeautifulSoup

BLOCK_WORDS = [


"あわせて読みたい",
"関連記事",
"Sponsored",
"広告",
"PR",
"GIZMART",
"YouTube",


]

class GizmodoParser:


    # ========================================================================
    # Rewrite Overlay
    # ========================================================================

    REWRITE_OVERLAY = """


    * 必ず日本語で出力
    * 英語禁止
    * 日本語ガジェット記事風
    * 軽いレビュー調
    * 不自然な翻訳口調禁止
    * SNS英語口調禁止

    """


    # ========================================================================
    # Extract Image
    # ========================================================================

    @classmethod
    def extract_image(
        cls,
        soup,
    ):

        try:

            # ================================================================
            # Open Graph Image
            # ================================================================

            og_image = soup.find(

                "meta",

                attrs={
                    "property": "og:image"
                }
            )

            if og_image:

                image_url = og_image.get(
                    "content",
                    ""
                ).strip()

                if image_url:

                    return image_url

            return ""

        except Exception as e:

            print(
                f"⚠ Gizmodo extract_image Error: {e}"
            )

            return ""

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
            # Main Body
            # ================================================================

            body = soup.find(
                "article",
            )

            # ================================================================
            # Fallback:
            # Meta Description
            # ================================================================

            if not body:

                print(
                    "⚠ Gizmodo body not found"
                )

                print(
                    "🔄 fallback => meta description"
                )

                meta_description = soup.find(

                    "meta",

                    attrs={
                        "name": "description"
                    }
                )

                if meta_description:

                    content = meta_description.get(

                        "content",
                        ""

                    ).strip()

                    if content:

                        return content

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

                if len(text) < 20:
                    continue

                text_parts.append(text)

            # ================================================================
            # Final Join
            # ================================================================

            final_text = "\n".join(
                text_parts
            )

            # ================================================================
            # Empty Fallback
            # ================================================================

            if not final_text:

                meta_description = soup.find(

                    "meta",

                    attrs={
                        "name": "description"
                    }
                )

                if meta_description:

                    content = meta_description.get(

                        "content",
                        ""

                    ).strip()

                    if content:

                        return content

            return final_text

        except Exception as e:

            print(
                f"⚠ Gizmodo Parser Error: {e}"
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
                f"⚠ Gizmodo fetch_html Error: {e}"
            )

            return ""

