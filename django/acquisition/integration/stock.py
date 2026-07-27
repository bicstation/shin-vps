# /home/maya/shin-vps/django/acquisition/integration/stock.py

# ============================================================================
# FILE:
# acquisition/integration/stock.py
#
# SHIN CORE LINX
# Integration Stock Runtime
#
# Responsibilities
#
# - Reset product stock before import
# - Manage stock state during import
#
# NOT
#
# - Product Persistence
# - Business Logic
# - SEO
# - Provider-specific Logic
# ============================================================================

from __future__ import annotations

from api.models.pc_products import PCProduct


class ImportStock:
    """
    Stock Runtime for Integration Import.

    This runtime prepares PCProduct stock state before the
    Integration Runtime begins.

    Notes
    -----
    Products remain visible (is_active=True) for SEO purposes.
    Only stock_status is reset before each import.
    """

    def reset(self) -> int:
        """
        Reset stock status before import.

        Returns
        -------
        int
            Number of updated products.
        """

        return PCProduct.objects.update(
            is_active=True,
            stock_status="在庫なし",
        )
        