# /home/maya/shin-dev/shin-vps/django/acquisition/integration/repository.py
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
==============================================================================
"""


from __future__ import annotations
from typing import Any
from api.models import PCProduct

class ImportRepository:
    """
    Acquisition Integration Repository.

    Responsibility
    --------------
    PCProduct Payload
            ↓
        PCProduct
    """

    # =========================================================
    # Save
    # =========================================================

    def save(
        self,
        payload: dict[str, Any],
    ) -> tuple[PCProduct, bool]:
        """
        Persist a single PCProduct payload.
        """

        unique_id = payload["unique_id"]

        defaults = payload.copy()
        defaults.pop("unique_id", None)
        
        
        product, created = PCProduct.objects.update_or_create(
            unique_id=unique_id,
            defaults=defaults,
        )

        print("=" * 60)
        print("💾 AFTER UPDATE_OR_CREATE")
        print("=" * 60)

        print("payload.price :", defaults.get("price"))
        print("object.price  :", product.price)

        print("payload.maker :", defaults.get("maker"))
        print("object.maker  :", product.maker)

        product.refresh_from_db()

        print("db.price      :", product.price)
        print("db.maker      :", product.maker)

        print("=" * 60)

        return product, created


    # =========================================================
    # Save Many
    # =========================================================

    def save_many(
        self,
        payloads: list[dict[str, Any]],
    ) -> list[PCProduct]:
        """
        Persist multiple PCProduct payloads.
        """

        products: list[PCProduct] = []

        for payload in payloads:

            product, _ = self.save(payload)

            products.append(product)

        return products