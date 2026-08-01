#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/linkshare/run.py
==============================================================================
"""

from __future__ import annotations


def main(
    *,
    method: str,
    mid: str | None = None,
    list_only: bool = False,
) -> None:
    """
    Execute LinkShare Acquisition Pipeline.
    """

    match method:

        # ==========================================================
        # FTP Runtime
        # ==========================================================

        case "ftp":

            from .ftp.pipeline import main as pipeline_main

            pipeline_main(
                mid=mid,
            )

        # ==========================================================
        # API Runtime
        # ==========================================================

        case "api":

            #
            # Advertiser List
            #

            if list_only:

                from .api.acquire import LinkShareAPIAcquireRuntime

                runtime = LinkShareAPIAcquireRuntime()

                runtime.list_merchants()

                return

            #
            # Product Pipeline
            #

            from .api.pipeline import main as pipeline_main

            pipeline_main(
                mid=mid,
            )

        # ==========================================================
        # Unsupported
        # ==========================================================

        case _:

            raise ValueError(
                f"Unsupported acquisition method: {method}"
            )


if __name__ == "__main__":

    raise SystemExit(
        "This module is intended to be executed from import_products."
    )