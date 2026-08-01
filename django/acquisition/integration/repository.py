#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/integration/repository.py

SHIN CORE LINX
Acquisition Integration Repository

Pipeline

PCProduct Payload
        │
        ▼
ImportRepository
        │
        ▼
PCProduct

Responsibilities

- Persist PCProduct Payload
- Update Existing Product
- Bulk Save

NOT

- Runtime
- Builder
- Observation
- HTML
- TSV
- Semantic
- Trace
==============================================================================
"""

from __future__ import annotations

from typing import Any

from api.models import PCProduct


class ImportRepository:
    """
    ==========================================================================
    Acquisition Integration Repository
    ==========================================================================

    Responsibilities

    - Persist PCProduct Payload
    - Update Existing Product
    - Bulk Save

    This repository is responsible only for persistence.
    """

    # ------------------------------------------------------------------
    # Save One
    # ------------------------------------------------------------------

    def save(
        self,
        payload: dict[str, Any],
    ) -> tuple[PCProduct, bool]:

        unique_id = payload["unique_id"]

        defaults = payload.copy()

        defaults.pop(
            "unique_id",
            None,
        )

        product, created = PCProduct.objects.update_or_create(

            unique_id=unique_id,

            defaults=defaults,

        )

        return product, created

    # ------------------------------------------------------------------
    # Save Many
    # ------------------------------------------------------------------

    def save_many(
        self,
        payloads: list[dict[str, Any]],
    ) -> list[PCProduct]:

        products: list[PCProduct] = []

        for payload in payloads:

            product, _ = self.save(
                payload,
            )

            products.append(
                product,
            )

        return products