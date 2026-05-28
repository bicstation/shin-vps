# ============================================================================
# FILE:
# /home/maya/shin-vps/satellite_ops/runtime/engine/runtime_engine.py
# ============================================================================
# SHIN SATELLITE OPS｜Runtime Engine
# ============================================================================
# Purpose:
# Central lightweight orchestration runtime
# ============================================================================

import random

from satellite_ops.registry.blogs.blog_loader import (load_blog,)
from satellite_ops.registry.rss.rss_loader import (load_rss_by_categories,)
from satellite_ops.runtime.models.runtime_context import (RuntimeContext,)
from satellite_ops.runtime.rss.rss_orchestrator import (RSSOrchestrator,)
from satellite_ops.runtime.rewrite.rewrite_orchestrator import (RewriteOrchestrator,)
from satellite_ops.runtime.render.render_orchestrator import (RenderOrchestrator,)
from satellite_ops.runtime.dispatch.dispatch_orchestrator import (DispatchOrchestrator,)
from satellite_ops.observatory.runtime_observer import (RuntimeObserver,)
from satellite_ops.runtime.categories.category_map import (CATEGORY_LABELS,)


# ============================================================================
# Runtime Engine
# ============================================================================


class RuntimeEngine:

    # ------------------------------------------------------------------------
    # Init
    # ------------------------------------------------------------------------

    def __init__(self):

        self.observer = RuntimeObserver()

        self.rss = RSSOrchestrator()

        self.rewrite = RewriteOrchestrator()

        self.render = RenderOrchestrator()

        self.dispatch = DispatchOrchestrator()

    # ------------------------------------------------------------------------
    # Execute
    # ------------------------------------------------------------------------

    def execute(

        self,
        blog_name: str,
        enable_real_post: bool = True,       
        rss_filter: str | None = None,

    ):
        
        # --------------------------------------------------------------------
        # Runtime Context
        # --------------------------------------------------------------------

        context = RuntimeContext()

        # --------------------------------------------------------------------
        # Runtime Start
        # --------------------------------------------------------------------

        self.observer.section(
            "🛰 SHIN SATELLITE OPS"
        )

        # --------------------------------------------------------------------
        # Load Blog
        # --------------------------------------------------------------------

        context.blog = load_blog(
            blog_name
        )

        if not context.blog:

            self.observer.error(
                "Blog not found."
            )

            return False

        self.observer.section(
            "📌 Blog"
        )

        self.observer.info(
            context.blog
        )

        # --------------------------------------------------------------------
        # Load RSS Sources
        # --------------------------------------------------------------------

        rss_sources = load_rss_by_categories(

            context.blog.get(
                "allowed_categories",
                [],
            )
        )

        if not rss_sources:

            self.observer.error(
                "No RSS sources found."
            )

            return False

        # --------------------------------------------------------------------
        # RSS Observability
        # --------------------------------------------------------------------

        self.observer.section(
            "📡 Available RSS Sources"
        )

        for rss in rss_sources:

            self.observer.info(

                f"{rss.get('source_name', 'UnknownSource')}"

                f" => "

                f"{rss.get('rss_url', '')}"
            )
        
        # --------------------------------------------------------------------
        # RSS Filter
        # --------------------------------------------------------------------
        
        if rss_filter:

            rss_sources = [

                rss for rss in rss_sources

                if (

                    rss_filter.lower()

                    in rss.get(
                        "source_name",
                        ""
                    ).lower()

                    or

                    rss_filter.lower()

                    in rss.get(
                        "rss_url",
                        ""
                    ).lower()
                )
            ]

            self.observer.section(
                "🎯 RSS Filter"
            )

            self.observer.info(
                rss_filter
            )

        if not rss_sources:

            self.observer.error(
                "Filtered RSS sources not found."
            )

            return False

        # --------------------------------------------------------------------
        # Select RSS
        # --------------------------------------------------------------------

        context.rss_source = random.choice(
            rss_sources
        )

        self.observer.section(
            "📡 Selected RSS"
        )

        self.observer.info(

            context.rss_source.get(
                "source_name",
                "UnknownSource",
            )
        )

        # --------------------------------------------------------------------
        # RSS Runtime
        # --------------------------------------------------------------------

        rss_runtime = self.rss.execute(
            context.rss_source
        )

        if not rss_runtime.get(
            "success",
            False,
        ):

            self.observer.error(

                rss_runtime.get(
                    "error",
                    "rss_runtime_failed",
                )
            )

            return False

        # --------------------------------------------------------------------
        # Runtime Payload
        # --------------------------------------------------------------------

        context.topic = rss_runtime.get(
            "topic",
            {},
        )

        context.normalized = rss_runtime.get(
            "normalized",
            {},
        )

        context.parser_name = rss_runtime.get(
            "parser",
            "UnknownParser",
        )

        context.extractor_name = rss_runtime.get(
            "extractor",
            "UnknownExtractor",
        )

        context.source_name = rss_runtime.get(
            "source_name",
            "UnknownSource",
        )

        context.source_url = rss_runtime.get(
            "source_url",
            "",
        )

        # --------------------------------------------------------------------
        # Topic Observability
        # --------------------------------------------------------------------

        self.observer.section(
            "📰 Selected Topic"
        )

        self.observer.info(
            context.topic
        )

        # --------------------------------------------------------------------
        # Runtime Observability
        # --------------------------------------------------------------------

        self.observer.parser_runtime(
            context.parser_name
        )

        self.observer.extractor_runtime(
            context.extractor_name
        )

        self.observer.source_runtime(

            context.source_name,

            context.source_url,
        )

        # --------------------------------------------------------------------
        # Normalized Runtime
        # --------------------------------------------------------------------

        article_text = context.normalized.get(
            "body",
            "",
        )

        context.image_url = (
            context.normalized.get(
                "image_url",
                "",
            )
        )

        normalized_title = (
            context.normalized.get(
                "title",
                "",
            )
        )

        # --------------------------------------------------------------------
        # Validation
        # --------------------------------------------------------------------

        if not article_text:

            self.observer.error(
                "Article normalization failed."
            )

            return False

        self.observer.success(
            "Article normalized"
        )

        if context.image_url:

            self.observer.success(
                "Image normalized"
            )

            self.observer.info(
                context.image_url
            )

        else:

            self.observer.warning(
                "No normalized image"
            )

        # --------------------------------------------------------------------
        # Article Preview
        # --------------------------------------------------------------------

        self.observer.section(
            "📰 Article Preview"
        )

        self.observer.info(
            article_text[:500]
        )

        # --------------------------------------------------------------------
        # Rewrite Runtime
        # --------------------------------------------------------------------

        rewrite_overlay = getattr(

            rss_runtime.get(
                "parser_instance",
                None,
            ),

            "REWRITE_OVERLAY",

            ""

        )

        context.rewritten_text = (

            self.rewrite.execute(
                article_text[:4000],
                context.blog.get(
                    "persona",
                    "",
                ),
                source_type=context.source_name.lower(),
                overlay=rewrite_overlay,
            )

        )

        
        # --------------------------------------------------------------------
        # Rewrite Validation
        # --------------------------------------------------------------------

        if not context.rewritten_text:

            context.rewritten_text = (
                article_text
            )

        # --------------------------------------------------------------------
        # Rewrite Observability
        # --------------------------------------------------------------------

        self.observer.rewrite_preview(
            context.rewritten_text
        )

        self.observer.metrics(
            context.rewritten_text
        )

        # --------------------------------------------------------------------
        # Title Stabilization
        # --------------------------------------------------------------------

        context.satellite_title = (

            normalized_title

            .replace("　", " ")

            .replace("｜", " ")

            .strip()
        )

        self.observer.section(
            "🧠 Stabilized Title"
        )

        self.observer.info(
            context.satellite_title
        )

        # --------------------------------------------------------------------
        # Render Runtime
        # --------------------------------------------------------------------

        render_result = self.render.execute(

            rewritten_text=context.rewritten_text,

            title=context.satellite_title,

            persona=context.blog.get(
                "persona",
                "",
            ),

            image_url=context.image_url,

            source_url=context.source_url,

            source_name=context.source_name,
        )

        # --------------------------------------------------------------------
        # Render Validation
        # --------------------------------------------------------------------

        if not render_result.get(
            "success",
            False,
        ):

            self.observer.error(

                render_result.get(
                    "error",
                    "render_failed",
                )
            )

            return False

        context.html = render_result.get(
            "html",
            "",
        )

        # --------------------------------------------------------------------
        # HTML Preview
        # --------------------------------------------------------------------

        self.observer.html_preview(
            context.html
        )
        
        
        # --------------------------------------------------------------------
        # Category Normalize
        # --------------------------------------------------------------------

        category = context.rss_source.get(
        "category",
        "",
        )

        # list → string

        if isinstance(category, list):
            category = (
                category[0]
                if category
                else ""
            )


        # internal → display label

        category = CATEGORY_LABELS.get(
            category,
            category,
        )
       

        # --------------------------------------------------------------------
        # Dispatch Runtime
        # --------------------------------------------------------------------

        if enable_real_post:

            self.observer.section(
                "🚀 Dispatch Runtime"
            )

            context.dispatch_result = (

                self.dispatch.execute(

                    blog=context.blog,

                    title=context.satellite_title,

                    html=context.html,

                    image_url=None,

                    category=category,
                )
            )

            context.success = (

                context.dispatch_result.get(
                    "success",
                    False,
                )
            )

            if context.success:

                self.observer.success(
                    "Dispatch Success"
                )

            else:

                self.observer.error(

                    context.dispatch_result.get(
                        "error",
                        "dispatch_failed",
                    )
                )

                context.error = (

                    context.dispatch_result.get(
                        "error",
                        "dispatch_failed",
                    )
                )

        # --------------------------------------------------------------------
        # Runtime Complete
        # --------------------------------------------------------------------
        
        self.observer.section(
            "🧠 Category Runtime"
        )

        self.observer.info(
            category
        )

        self.observer.section(
            "✅ Runtime Complete"
        )

        context.success = True

        return context