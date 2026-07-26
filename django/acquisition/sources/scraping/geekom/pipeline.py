#!/usr/bin/env python3
"""
GEEKOM Reality Pipeline

Acquire Reality
        ↓
Observe Reality
        ↓
Normalize Reality
        ↓
Build Import Contract
"""

from imports.geekom.scripts.fetch_root import main as fetch_root
from imports.geekom.scripts.discover_root import main as discover_root

from imports.geekom.scripts.fetch_list import main as fetch_list
from imports.geekom.scripts.discover_list import main as discover_list

from imports.geekom.scripts.fetch_product import main as fetch_product

from imports.geekom.scripts.observe import main as observe
from imports.geekom.scripts.formatter import main as formatter
from imports.geekom.scripts.mapper import main as mapper


# ==========================================================
# Acquire Reality
# ==========================================================

def run_acquire() -> None:
    """Acquire Reality."""

    fetch_root()
    discover_root()

    fetch_list()
    discover_list()

    fetch_product()


# ==========================================================
# Observe Reality
# ==========================================================

def run_observe() -> None:
    """Observe Reality."""

    observe()


# ==========================================================
# Normalize Reality
# ==========================================================

def run_formatter() -> None:
    """Build Payload."""

    formatter()


# ==========================================================
# Build Import Contract
# ==========================================================

def run_mapper() -> None:
    """Build Import Contract."""

    mapper()


# ==========================================================
# Reality Pipeline
# ==========================================================

def run() -> None:
    """Execute GEEKOM Reality Pipeline."""

    run_acquire()
    run_observe()
    run_formatter()
    run_mapper()