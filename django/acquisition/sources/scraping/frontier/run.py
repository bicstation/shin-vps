#!/usr/bin/env python3
"""
FRONTIER Runtime Runner
"""

from __future__ import annotations

from .pipeline import run


# ==========================================================
# Main
# ==========================================================

def main(force: bool = False):

    run(force=force)


if __name__ == "__main__":
    main()