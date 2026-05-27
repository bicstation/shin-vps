# ============================================================================
# FILE:
# /home/maya/shin-vps/satellite_ops/runtime/dispatch/dispatch_orchestrator.py
# ============================================================================
# SHIN SATELLITE OPS｜Dispatch Orchestrator
# ============================================================================
# Purpose:
# Dispatch orchestration authority
# ============================================================================
# Responsibilities:
#
# - platform dispatch routing
# - driver selection
# - dispatch continuity
# - lightweight observability
# - future retry integration
#
# ============================================================================

from satellite_ops.dispatch.drivers.livedoor_driver import (
    LivedoorDriver,
)

# ============================================================================
# Dispatch Orchestrator
# ============================================================================


class DispatchOrchestrator:

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

        blog: dict,

        title: str,

        html: str,

        image_url: str = None,

    ) -> dict:
        """
        Execute dispatch runtime.
        """

        # --------------------------------------------------------------------
        # Validation
        # --------------------------------------------------------------------

        if not blog:

            return {

                "success": False,

                "error": "empty_blog",
            }

        if not title:

            return {

                "success": False,

                "error": "empty_title",
            }

        if not html:

            return {

                "success": False,

                "error": "empty_html",
            }

        # --------------------------------------------------------------------
        # Platform
        # --------------------------------------------------------------------

        platform = blog.get(
            "platform",
            "",
        ).lower()

        # --------------------------------------------------------------------
        # Driver Routing
        # --------------------------------------------------------------------

        if platform == "livedoor":

            driver = LivedoorDriver(
                blog
            )

        else:

            return {

                "success": False,

                "error": "unsupported_platform",

                "platform": platform,
            }

        # --------------------------------------------------------------------
        # Dispatch
        # --------------------------------------------------------------------

        success = driver.post(

            title=title,

            body=html,

            image_url=image_url,
        )

        # --------------------------------------------------------------------
        # Result
        # --------------------------------------------------------------------

        return {

            "success": success,

            "platform": platform,

            "title": title,
        }