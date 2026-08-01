# /home/maya/shin-dev/shin-vps/django/acquisition/common/trace/product.py

#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/common/trace/product.py

SHIN CORE LINX
Product Trace

Responsibilities

- Print Final Product
- Runtime Verification

NOT

- Summary
- Pipeline
- Error
- Diff
==============================================================================
"""

from __future__ import annotations

from pprint import pformat


class ProductTrace:
    """
    Final Product Trace.
    """

    TITLE = "FINAL PCPRODUCT"

    @classmethod
    def print(
        cls,
        product,
    ) -> None:

        print()
        print("=" * 70)
        print(f"🖥️ {cls.TITLE}")
        print("=" * 70)

        for field in product._meta.fields:

            value = getattr(
                product,
                field.name,
            )

            print(
                f"{field.name:<28}: {value}"
            )

        print("=" * 70)
        print()