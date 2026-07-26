# /home/maya/shin-dev/shin-vps/django/acquisition/common/affiliate/builder.py
#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/common/affiliate/builder.py

SHIN CORE LINX
Acquisition Affiliate Runtime

Responsibilities

- Build Affiliate Contract

NOT

- URL Algorithm
- Commerce
- Identity
- Semantic
==============================================================================
"""

from __future__ import annotations

from acquisition.common.affiliate.affiliate import (
    generate_affiliate_url,
)


class AffiliateBuilder:
    """
    Acquisition Affiliate Builder.
    """

    @classmethod
    def build(
        cls,
        product_url: str,
        config: dict,
    ) -> dict:
        """
        Build Affiliate Contract.
        """

        enabled = config.get(
            "enabled",
            False,
        )

        provider = config.get(
            "provider",
            "",
        )

        affiliate_url = ""

        if enabled:

            affiliate_url = generate_affiliate_url(
                product_url,
                config,
            )

        return {
            "enabled": enabled,
            "provider": provider,
            "url": affiliate_url,
        }