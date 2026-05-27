# /home/maya/shin-dev/shin-vps/satellite_ops/dispatch/renderers/html_renderer.py
# ============================================================================
# SHIN SATELLITE OPS｜HTML Renderer
# ============================================================================
# Purpose:
# Simple HTML rendering layer
# ============================================================================

from pathlib import Path
import random

from satellite_ops.personas.registry.persona_registry import PERSONAS

class HTMLRenderer:


    # ------------------------------------------------------------------------
    # Init
    # ------------------------------------------------------------------------

    def __init__(self):
        pass

    # ------------------------------------------------------------------------
    # Render Article
    # ------------------------------------------------------------------------

    def render_article(
        self,
        title,
        paragraphs,
        persona=None,
        cta_html=None,
        image_url=None,
        source_url=None,
        source_name=None,
        
    ) -> str:

        html = []

        # --------------------------------------------------------------------
        # Title
        # --------------------------------------------------------------------

        html.append(f"<h2>{title}</h2>")

        # --------------------------------------------------------------------
        # Persona Quote Injection
        # --------------------------------------------------------------------

        quote = None

        accent_color = "#2563eb"
        
        
        if persona:

            persona_config = PERSONAS.get(persona)

            if persona_config:

                quotes_path = persona_config.get("quotes_path")

                if quotes_path:
                    quote = self.load_random_quote(quotes_path)
            

        # if persona:

        #     persona_config = PERSONAS.get(persona)

        #     if persona_config:

        #         quotes_path = persona_config.get("quotes_path")

        #         if quotes_path:
        #             quote = self.load_random_quote(quotes_path)

        # --------------------------------------------------------------------
        # Quote Block
        # --------------------------------------------------------------------

        if quote:

            html.append(
                f"""
                <blockquote style="
                    border-left: 4px solid {accent_color};
                    padding-left: 15px;
                    color: #475569;
                    margin: 20px 0;
                ">
                    {quote}
                </blockquote>
                """
            )

        # --------------------------------------------------------------------
        # Paragraphs
        # --------------------------------------------------------------------

        for paragraph in paragraphs:
            html.append(f"<p>{paragraph}</p>")
            
        # --------------------------------------------------------------------
        # Source Attribution
        # --------------------------------------------------------------------

        if source_url:

            html.append(
                f"""
                <p style="
                    margin-top:24px;
                    font-size:12px;
                    color:#777;
                ">
                出典：
                <a
                    href="{source_url}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                {source_name or source_url}
                </a>
                </p>
                """
            )
            
        # --------------------------------------------------------------------
        # CTA
        # --------------------------------------------------------------------

        if cta_html:
            html.append(cta_html)



        # --------------------------------------------------------------------
        # Final HTML
        # --------------------------------------------------------------------

        return "\n".join(html)

    # ------------------------------------------------------------------------
    # Load Random Quote
    # ------------------------------------------------------------------------

    def load_random_quote(self, quotes_path: str):

        path = Path(quotes_path)

        if not path.exists():
            return None

        with open(path, "r", encoding="utf-8") as f:

            quotes = [
                line.strip()
                for line in f.readlines()
                if line.strip()
            ]

        if not quotes:
            return None

        return random.choice(quotes)

    # ------------------------------------------------------------------------
    # Load CTA
    # ------------------------------------------------------------------------

    def load_cta(self, cta_path: str):

        path = Path(cta_path)

        if not path.exists():
            return ""

        with open(path, "r", encoding="utf-8") as f:
            return f.read()

