#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/integration/orchestrator.py

SHIN CORE LINX
Acquisition Integration Orchestrator
==============================================================================
"""

from __future__ import annotations

from django.db import DataError

from acquisition.integration.normalizer import ImportNormalizer
from acquisition.integration.builder import ImportBuilder
from acquisition.integration.semantic import ImportSemantic
from acquisition.integration.model_mapper import ImportModelMapper
from acquisition.integration.repository import ImportRepository
from acquisition.integration.results import ImportResults
from acquisition.integration.stock import ImportStock


class ImportOrchestrator:

    def __init__(self) -> None:

        self.stock = ImportStock()
        self.normalizer = ImportNormalizer()
        self.builder = ImportBuilder()
        self.semantic = ImportSemantic()
        self.mapper = ImportModelMapper()
        self.repository = ImportRepository()

    def run(
        self,
        documents,
        *,
        maker: str,
        prefix: str,
        affiliate_config: dict,
    ) -> ImportResults:

        results = ImportResults()

        self.stock.reset()

        documents = list(documents)

        results.loaded = len(documents)

        for document in documents:

            try:

                #
                # Contract
                #

                contract = document.contract

                #
                # Normalize
                #

                normalized = self.normalizer.build(contract)
                results.normalized += 1

                #
                # Builder
                #

                builder_result = self.builder.build(
                    normalized,
                    affiliate_config=affiliate_config,
                    maker=maker,
                    prefix=prefix,
                )
                results.built += 1

                #
                # Semantic
                #

                semantic_result = self.semantic.build(
                    builder_result,
                )
                results.semantic += 1

                #
                # Model Mapper
                #

                payload = self.mapper.build(
                    builder_result,
                    semantic_result,
                )

                #
                # Repository
                #

                product, created = self.repository.save(
                    payload,
                )

            except DataError:
                continue

            results.products.append(product)

            if created:
                results.created += 1
            else:
                results.updated += 1

        results.summary()

        return results