#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/linkshare/run.py

SHIN CORE LINX
LinkShare Acquisition Runtime

Entry Point

Responsibilities

- Execute LinkShare Acquisition Pipeline
- Dispatch Acquisition Method

NOT

- Acquisition
- Formatter
- Observation
- Mapping
- Integration
- Business Logic
==============================================================================
"""

from __future__ import annotations


def main(
    *,
    method: str,
    mid: str,
) -> None:
    """
    Execute LinkShare Acquisition Pipeline.
    """

    match method:

        case "ftp":

            from .ftp.pipeline import main as pipeline_main

            pipeline_main(
                mid=mid,
            )

        case "api":

            raise NotImplementedError(
                "LinkShare API Runtime is not implemented."
            )

        case _:

            raise ValueError(
                f"Unsupported acquisition method: {method}"
            )


if __name__ == "__main__":

    raise SystemExit(
        "This module is intended to be executed from import_products."
    )