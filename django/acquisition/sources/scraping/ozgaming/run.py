#!/usr/bin/env python3
"""
OZ GAMING Runtime Entry Point
"""

from __future__ import annotations

from .pipeline import run

def main(
    *,
    method: str = "default",
    mid: str | None = None,
    list_only: bool = False,
    force: bool = False,
) :

    run()


if __name__ == "__main__":

    main()