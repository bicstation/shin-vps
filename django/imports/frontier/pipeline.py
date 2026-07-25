#!/usr/bin/env python3
"""
FRONTIER Reality Pipeline

Pipeline

    Download
        ↓
    Discovery
        ↓
    Formatter
        ↓
    Mapper
"""

from imports.frontier.scripts.fetch_list import fetch as download_pages
from imports.frontier.scripts.discover_series import main as discover_series
from imports.frontier.scripts.discover_products import main as discover_products
from imports.frontier.scripts.formatter_list import main as formatter
from imports.frontier.scripts.mapper import main as mapper


# ==========================================================
# Download
# ==========================================================

def run_download() -> None:
    """Acquire Reality."""

    download_pages()


# ==========================================================
# Discovery
# ==========================================================

def run_discovery() -> None:
    """Discover semantic Reality."""

    discover_series()
    discover_products()


# ==========================================================
# Formatter
# ==========================================================

def run_formatter() -> None:
    """Build payload."""

    formatter()


# ==========================================================
# Mapper
# ==========================================================

def run_mapper() -> None:
    """Build import contract."""

    mapper()


# ==========================================================
# Pipeline
# ==========================================================

def run() -> None:
    """Execute FRONTIER Reality Pipeline."""

    run_download()
    run_discovery()
    run_formatter()
    run_mapper()