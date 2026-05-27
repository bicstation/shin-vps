# ============================================================================
# FILE:
# /home/maya/shin-vps/satellite_ops/runtime/models/runtime_context.py
# ============================================================================
# SHIN SATELLITE OPS｜Runtime Context
# ============================================================================
# Purpose:
# Central runtime state container
# ============================================================================
# Responsibilities:
#
# - runtime payload continuity
# - orchestration state continuity
# - lightweight runtime transport
# - future retry/cadence compatibility
#
# ============================================================================

from dataclasses import dataclass, field

# ============================================================================
# Runtime Context
# ============================================================================


@dataclass
class RuntimeContext:

    # ------------------------------------------------------------------------
    # Blog Runtime
    # ------------------------------------------------------------------------

    blog: dict = field(
        default_factory=dict
    )

    # ------------------------------------------------------------------------
    # RSS Runtime
    # ------------------------------------------------------------------------

    rss_source: dict = field(
        default_factory=dict
    )

    topic: dict = field(
        default_factory=dict
    )

    normalized: dict = field(
        default_factory=dict
    )

    # ------------------------------------------------------------------------
    # Rewrite Runtime
    # ------------------------------------------------------------------------

    rewritten_text: str = ""

    # ------------------------------------------------------------------------
    # Render Runtime
    # ------------------------------------------------------------------------

    html: str = ""

    # ------------------------------------------------------------------------
    # Dispatch Runtime
    # ------------------------------------------------------------------------

    dispatch_result: dict = field(
        default_factory=dict
    )

    # ------------------------------------------------------------------------
    # Runtime Metadata
    # ------------------------------------------------------------------------

    satellite_title: str = ""

    image_url: str = ""

    source_url: str = ""

    source_name: str = ""

    parser_name: str = ""

    extractor_name: str = ""

    # ------------------------------------------------------------------------
    # Runtime Status
    # ------------------------------------------------------------------------

    success: bool = False

    error: str = ""