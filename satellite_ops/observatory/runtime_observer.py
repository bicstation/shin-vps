# ============================================================================
# FILE:
# /home/maya/shin-vps/satellite_ops/observatory/runtime_observer.py
# ============================================================================
# SHIN SATELLITE OPS｜Runtime Observer
# ============================================================================
# Purpose:
# Centralized runtime observability layer
# ============================================================================


class RuntimeObserver:

    # ------------------------------------------------------------------------
    # Init
    # ------------------------------------------------------------------------

    def __init__(self):

        pass

    # ------------------------------------------------------------------------
    # Section
    # ------------------------------------------------------------------------

    def section(

        self,

        title: str,

    ):

        print(f"\n{title}\n")

    # ------------------------------------------------------------------------
    # Info
    # ------------------------------------------------------------------------

    def info(

        self,

        message,

    ):

        print(message)

    # ------------------------------------------------------------------------
    # Success
    # ------------------------------------------------------------------------

    def success(

        self,

        message: str,

    ):

        print(f"✅ {message}")

    # ------------------------------------------------------------------------
    # Warning
    # ------------------------------------------------------------------------

    def warning(

        self,

        message: str,

    ):

        print(f"⚠ {message}")

    # ------------------------------------------------------------------------
    # Error
    # ------------------------------------------------------------------------

    def error(

        self,

        message: str,

    ):

        print(f"❌ {message}")

    # ------------------------------------------------------------------------
    # Runtime Metrics
    # ------------------------------------------------------------------------

    def metrics(

        self,

        rewritten_text: str,

    ):

        self.section(
            "🧠 Rewrite Observability"
        )

        print(
            "Length:",
            len(rewritten_text),
        )

        print(
            "Paragraphs:",
            rewritten_text.count(
                "\n\n"
            ) + 1,
        )

    # ------------------------------------------------------------------------
    # Parser Runtime
    # ------------------------------------------------------------------------

    def parser_runtime(

        self,

        parser_name: str,

    ):

        self.section(
            "🧩 Parser Runtime"
        )

        self.info(
            parser_name
        )

    # ------------------------------------------------------------------------
    # Extractor Runtime
    # ------------------------------------------------------------------------

    def extractor_runtime(

        self,

        extractor_name: str,

    ):

        self.section(
            "🖼 Extractor Runtime"
        )

        self.info(
            extractor_name
        )

    # ------------------------------------------------------------------------
    # Source Runtime
    # ------------------------------------------------------------------------

    def source_runtime(

        self,

        source_name: str,

        source_url: str,

    ):

        self.section(
            "📰 Source Runtime"
        )

        self.info(
            source_name
        )

        self.info(
            source_url
        )

    # ------------------------------------------------------------------------
    # Rewrite Preview
    # ------------------------------------------------------------------------

    def rewrite_preview(

        self,

        rewritten_text: str,

    ):

        self.section(
            "🧠 Lightweight Rewrite"
        )

        self.info(
            rewritten_text[:1000]
        )

    # ------------------------------------------------------------------------
    # HTML Preview
    # ------------------------------------------------------------------------

    def html_preview(

        self,

        html: str,

    ):

        self.section(
            "🧠 HTML Preview"
        )

        self.info(
            html[:2000]
        )