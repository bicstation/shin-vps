# /home/maya/shin-vps/django/imports/integration/repository.py

"""
SHIN CORE LINX
Import Integration Repository

Pipeline

Semantic Payload
        │
        ▼
ImportRepository
        │
        ▼
PCProduct
"""

from __future__ import annotations

from typing import Any

from api.models import PCProduct

class ImportRepository:
    """
    Import Repository

    Responsibility
    --------------
    Semantic Payload
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
        Save payload into PCProduct.
        """

        unique_id = payload["unique_id"]

        defaults = payload.copy()
        defaults.pop("unique_id", None)

        product, created = PCProduct.objects.update_or_create(
            unique_id=unique_id,
            defaults=defaults,
        )

        return product, created

    # =========================================================
    # Save Many
    # =========================================================

    def save_many(
        self,
        payloads: list[dict[str, Any]],
    ) -> list[PCProduct]:

        products: list[PCProduct] = []

        created_count = 0
        updated_count = 0

        for payload in payloads:

            product, created = self.save(payload)

            products.append(product)

            if created:
                created_count += 1
            else:
                updated_count += 1

        print()
        print("========================================")
        print(f"Created : {created_count}")
        print(f"Updated : {updated_count}")
        print(f"Total   : {len(products)}")
        print("========================================")

        return products