#!/usr/bin/env python3
# ============================================================================
# FILE:
# acquisition/integration/import_service.py
# Copyright (c) 2026 Shin Corporation.
# All rights reserved.
# ============================================================================

"""
==============================================================================
SHIN CORE LINX
Integration Import Service
==============================================================================

Responsibilities

- Public Entry Point of Integration Runtime
- Execute Import Orchestrator

NOT

- Builder
- Semantic
- Repository
- Persistence
- Business Logic

Flow

ImportDocument
        │
        ▼
ImportService
        │
        ▼
ImportOrchestrator
"""

from __future__ import annotations

from acquisition.integration.orchestrator import ImportOrchestrator


class ImportService:
    """
    Public entry point of the Integration Runtime.
    """

    @classmethod
    def run(cls, *args, **kwargs):

        orchestrator = ImportOrchestrator()

        return orchestrator.run(*args, **kwargs)