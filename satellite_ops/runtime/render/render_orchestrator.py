# ============================================================================
# FILE:
# /home/maya/shin-vps/satellite_ops/runtime/render/render_orchestrator.py
# ============================================================================
# SHIN SATELLITE OPS｜Render Orchestrator
# ============================================================================
# Purpose:
# Render orchestration authority
# ============================================================================
# Responsibilities:
#
# - paragraph shaping
# - HTML rendering
# - lightweight atmosphere continuity
# - source attribution
# - render payload generation
#
# ============================================================================

from satellite_ops.dispatch.renderers.paragraph_renderer import (
    build_paragraphs,
)

from satellite_ops.dispatch.renderers.html_renderer import (
    HTMLRenderer,
)

# ============================================================================
# Render Orchestrator
# ============================================================================


class RenderOrchestrator:

    # ------------------------------------------------------------------------
    # Init
    # ------------------------------------------------------------------------

    def __init__(self):

        self.renderer = HTMLRenderer()

    # ------------------------------------------------------------------------
    # Execute
    # ------------------------------------------------------------------------

    def execute(

        self,

        rewritten_text: str,

        title: str,

        persona: str = "",

        image_url: str = "",

        source_url: str = "",

        source_name: str = "",

        cta_html: str = "",

    ) -> dict:

        # --------------------------------------------------------------------
        # Validation
        # --------------------------------------------------------------------

        if not rewritten_text:

            return {

                "success": False,

                "error": "empty_rewritten_text",
            }

        if not title:

            return {

                "success": False,

                "error": "empty_title",
            }

        # --------------------------------------------------------------------
        # Paragraph Build
        # --------------------------------------------------------------------

        paragraphs = build_paragraphs(
            rewritten_text
        )

        # --------------------------------------------------------------------
        # HTML Render
        # --------------------------------------------------------------------

        html = self.renderer.render_article(

            title=title,

            paragraphs=paragraphs,

            persona=persona,

            cta_html=cta_html,

            image_url=image_url,

            source_url=source_url,

            source_name=source_name,
        )

        # --------------------------------------------------------------------
        # Validation
        # --------------------------------------------------------------------

        if not html:

            return {

                "success": False,

                "error": "html_render_failed",
            }

        # --------------------------------------------------------------------
        # Runtime Payload
        # --------------------------------------------------------------------

        return {

            "success": True,

            "html": html,

            "paragraph_count": len(
                paragraphs
            ),
        }