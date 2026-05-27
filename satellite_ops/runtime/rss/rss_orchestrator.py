# ============================================================================
# FILE:
# /home/maya/shin-vps/satellite_ops/runtime/rss/rss_orchestrator.py
# ============================================================================
# SHIN SATELLITE OPS｜RSS Orchestrator
# ============================================================================
# Purpose:
# RSS orchestration authority
# ============================================================================
# Responsibilities:
#
# - RSS fetch orchestration
# - RSS topic selection
# - parser continuity
# - normalization routing
# - sanitation routing
# - runtime payload generation
# - lightweight observability
#
# ============================================================================

import random

from satellite_ops.runtime.fetch.rss_fetcher import (
    fetch_rss_titles,
)

from satellite_ops.runtime.rss.normalizer import (
    normalize_article,
)

from satellite_ops.runtime.rss.sanitation.noise_filter import (
    filter_noise,
)

# ============================================================================
# RSS Orchestrator
# ============================================================================


class RSSOrchestrator:

    # ------------------------------------------------------------------------
    # Init
    # ------------------------------------------------------------------------

    def __init__(self):

        pass

    # ------------------------------------------------------------------------
    # Execute
    # ------------------------------------------------------------------------

    def execute(

        self,

        rss_source: dict,

    ) -> dict:
        """
        Execute RSS runtime flow.

        Flow:

        RSS Source
            ↓
        RSS Fetch
            ↓
        Topic Select
            ↓
        Normalize
            ↓
        Noise Cleanup
            ↓
        Runtime Payload
        """

        # --------------------------------------------------------------------
        # Validation
        # --------------------------------------------------------------------

        if not rss_source:

            return {}

        rss_url = rss_source.get(
            "rss_url",
            "",
        )

        if not rss_url:

            return {}

        # --------------------------------------------------------------------
        # RSS Fetch
        # --------------------------------------------------------------------

        rss_topics = fetch_rss_titles(
            rss_url
        )

        # --------------------------------------------------------------------
        # Fetch Validation
        # --------------------------------------------------------------------

        if not rss_topics:

            return {

                "success": False,

                "error": "rss_fetch_failed",

                "rss_source": rss_source,
            }

        # --------------------------------------------------------------------
        # Topic Select
        # --------------------------------------------------------------------

        topic = random.choice(
            rss_topics
        )

        # --------------------------------------------------------------------
        # Topic Validation
        # --------------------------------------------------------------------

        if not topic:

            return {

                "success": False,

                "error": "empty_topic",

                "rss_source": rss_source,
            }

        # --------------------------------------------------------------------
        # Normalize
        # --------------------------------------------------------------------

        normalized = normalize_article(
            topic
        )

        # --------------------------------------------------------------------
        # Normalize Validation
        # --------------------------------------------------------------------

        if not normalized:

            return {

                "success": False,

                "error": "normalize_failed",

                "topic": topic,

                "rss_source": rss_source,
            }

        # --------------------------------------------------------------------
        # Article Body
        # --------------------------------------------------------------------

        article_text = normalized.get(
            "body",
            "",
        )

        # --------------------------------------------------------------------
        # Body Validation
        # --------------------------------------------------------------------

        if not article_text:

            return {

                "success": False,

                "error": "empty_article_body",

                "topic": topic,

                "normalized": normalized,

                "rss_source": rss_source,
            }

        # --------------------------------------------------------------------
        # Noise Cleanup
        # --------------------------------------------------------------------

        cleaned_text = filter_noise(
            article_text
        )

        # --------------------------------------------------------------------
        # Cleanup Validation
        # --------------------------------------------------------------------

        if not cleaned_text:

            cleaned_text = article_text

        # --------------------------------------------------------------------
        # Inject Cleaned Text
        # --------------------------------------------------------------------

        normalized["body"] = (
            cleaned_text
        )

        # --------------------------------------------------------------------
        # Runtime Payload
        # --------------------------------------------------------------------

        return {

            # --------------------------------------------------------------
            # Runtime Status
            # --------------------------------------------------------------

            "success": True,

            # --------------------------------------------------------------
            # Source
            # --------------------------------------------------------------

            "rss_source": rss_source,

            # --------------------------------------------------------------
            # Topic
            # --------------------------------------------------------------

            "topic": topic,

            # --------------------------------------------------------------
            # Normalized
            # --------------------------------------------------------------

            "normalized": normalized,

            # --------------------------------------------------------------
            # Runtime Metadata
            # --------------------------------------------------------------

            "parser": normalized.get(
                "parser",
                "UnknownParser",
            ),

            "extractor": normalized.get(
                "extractor",
                "UnknownExtractor",
            ),

            "source_name": normalized.get(
                "source_name",
                "UnknownSource",
            ),

            "source_url": normalized.get(
                "url",
                "",
            ),

            # --------------------------------------------------------------
            # Rewrite Runtime
            # --------------------------------------------------------------

            "article_length": len(
                cleaned_text
            ),

            "has_image": bool(

                normalized.get(
                    "image_url",
                    "",
                )
            ),
        }

    # ------------------------------------------------------------------------
    # Select RSS Source
    # ------------------------------------------------------------------------

    def select_rss_source(

        self,

        rss_sources: list,

    ) -> dict:

        if not rss_sources:

            return {}

        return random.choice(
            rss_sources
        )

    # ------------------------------------------------------------------------
    # Select Topic
    # ------------------------------------------------------------------------

    def select_topic(

        self,

        topics: list,

    ) -> dict:

        if not topics:

            return {}

        return random.choice(
            topics
        )