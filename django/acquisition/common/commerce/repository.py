# /home/maya/shin-dev/shin-vps/django/acquisition/common/commerce/repository.py
#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/common/commerce/repository.py

SHIN CORE LINX
Commerce Reality Repository

Responsibilities

- Load Reality Store
- Find Commerce Reality

NOT

- Business Logic
- Builder
- Identity
- Affiliate
- Observation
==============================================================================
"""

from __future__ import annotations

import csv
from pathlib import Path


class CommerceRepository:
    """
    Commerce Reality Repository.
    """

    def __init__(
        self,
        runtime_dir: Path | None = None,
    ):

        if runtime_dir is None:

            runtime_dir = (
                Path(__file__)
                .resolve()
                .parents[3]
                / "sources"
                / "runtime"
                / "geekom"
            )

        self.tsv_path = runtime_dir / "product_list.tsv"

    def find(
        self,
        handle: str,
    ) -> dict | None:
        """
        Find Commerce Reality.
        """

        if not self.tsv_path.exists():
            return None

        with self.tsv_path.open(
            encoding="utf-8",
            newline="",
        ) as fp:

            reader = csv.DictReader(
                fp,
                delimiter="\t",
            )

            for row in reader:

                if row.get("handle") == handle:

                    return {

                        "price": row.get(
                            "price",
                            "",
                        ),

                        "stock": row.get(
                            "stock",
                            "",
                        ),

                        "delivery": row.get(
                            "delivery",
                            "",
                        ),

                        "currency": row.get(
                            "currency",
                            "JPY",
                        ),

                    }

        return None