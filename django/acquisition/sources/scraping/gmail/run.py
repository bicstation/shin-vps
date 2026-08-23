#!/usr/bin/env python3

from __future__ import annotations


def main(
    *,
    method: str,
    mid: str | None = None,
    list_only: bool = False,
    force: bool = False,
) -> None:

    match method:

        # ==========================================================
        # Lenovo Gmail Runtime
        # ==========================================================

        case "lenovo":

            from .lenovo.pipeline import (
                main as pipeline_main,
            )

            pipeline_main(
                force=force,
            )


        # ==========================================================
        # Unsupported
        # ==========================================================

        case _:

            raise ValueError(
                f"Unsupported Gmail acquisition method: {method}"
            )


if __name__ == "__main__":

    raise SystemExit(
        "This module is intended to be executed from import_products."
    )