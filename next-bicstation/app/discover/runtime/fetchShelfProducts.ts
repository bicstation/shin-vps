// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/runtime/fetchShelfProducts.ts
// ============================================================================

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Shelf Products Fetch
 * ============================================================================
 *
 * PURPOSE:
 *   - fetch products for semantic shelves
 *   - lightweight shelf runtime accessor
 *   - normalize shelf product access
 *
 * IMPORTANT:
 *   - semantic filtering authority is backend
 *   - frontend does not filter products manually
 *
 * ============================================================================
 */

import {
  fetchSemanticShelfRuntime,
} from './fetchSemanticShelfRuntime'

import type {
  ProductRuntime,
} from './contracts'

/* ============================================================================
🔥 Fetch Shelf Products
============================================================================ */

export async function fetchShelfProducts(

  attribute: string

): Promise<ProductRuntime[]> {

  try {

    /* ======================================================================
    🔥 Runtime
    ====================================================================== */

    const runtime =
      await fetchSemanticShelfRuntime(
        attribute
      )

    /* ======================================================================
    🔥 Products
    ====================================================================== */

    if (
      Array.isArray(
        runtime?.products
      )
    ) {

      return runtime.products
    }

    /* ======================================================================
    🔥 Empty
    ====================================================================== */

    return []

  } catch (error) {

    console.error(
      '🔥 Shelf Products Fetch Error:',
      attribute,
      error
    )

    /* ======================================================================
    🔥 Safe Empty
    ====================================================================== */

    return []
  }
}