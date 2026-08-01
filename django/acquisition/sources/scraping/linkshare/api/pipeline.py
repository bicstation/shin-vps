#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/linkshare/api/pipeline.py

SHIN CORE LINX
LinkShare API Pipeline

Responsibilities

- Execute LinkShare API Pipeline
- Orchestrate Runtime Flow

NOT

- OAuth2
- HTTP
- XML Parsing
- Observation Logic
- Mapping Logic
- Integration Logic
- PCProduct
==============================================================================
"""

from __future__ import annotations

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .acquire import LinkShareAPIAcquireRuntime
from .formatter import LinkShareAPIFormatterRuntime
from .observe import LinkShareAPIObservationRuntime
from .mapper import LinkShareAPIMapperRuntime
from .integration import LinkShareAPIIntegrationRuntime


class LinkShareAPIPipeline:
    """
    ==========================================================================
    LinkShare API Pipeline
    ==========================================================================

    LinkShare API
            ↓
    Acquire Runtime
            ↓
    AcquisitionDocument
            ↓
    Formatter Runtime
            ↓
    Runtime Records
            ↓
    Observation Runtime
            ↓
    ObservationDocument
            ↓
    Mapper Runtime
            ↓
    ImportDocument
            ↓
    Integration Runtime
            ↓
    PCProduct
    """

    def __init__(self) -> None:

        self.acquire = LinkShareAPIAcquireRuntime()
        self.formatter = LinkShareAPIFormatterRuntime()
        self.observer = LinkShareAPIObservationRuntime()
        self.mapper = LinkShareAPIMapperRuntime()
        self.integration = LinkShareAPIIntegrationRuntime()

    # ------------------------------------------------------------------
    # Runtime
    # ------------------------------------------------------------------

    def run(
        self,
        *,
        mid: str,
    ) -> None:

        #
        # Acquire
        #

        trace_pipeline("Acquire")

        acquisition_documents = self.acquire.run(
            mid=mid,
        )

        #
        # Formatter
        #

        trace_pipeline("Formatter")

        records = self.formatter.run(
            document=acquisition_documents[0],
        )

        #
        # Observation
        #

        trace_pipeline("Observation")

        observation_documents = self.observer.run(
            records=records,
        )

        #
        # Mapper
        #

        trace_pipeline("Mapper")

        import_documents = self.mapper.run(
            documents=observation_documents,
        )

        #
        # Integration
        #

        trace_pipeline("Integration")

        self.integration.run(
            documents=import_documents,
        )

        #
        # Complete
        #

        trace_pipeline("Complete")


# ============================================================================
# Runtime Entry Point
# ============================================================================

def main(
    *,
    mid: str,
) -> None:

    pipeline = LinkShareAPIPipeline()

    pipeline.run(
        mid=mid,
    )