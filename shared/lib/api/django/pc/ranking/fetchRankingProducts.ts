// ============================================================================
// FILE:
// fetchRankingProducts.ts
// SHIN CORE LINX
// Legacy Compatibility Layer
// ============================================================================

import type {

  ProjectedRankingProduct,

} from './projection'

import {

  getRankingRuntime,

} from './runtime'

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

/**
 * Legacy Frontend API
 *
 * Runtime
 * ↓
 * Projection
 * ↓
 * Products
 */

export async function fetchRankingProducts(

  slug: string

): Promise<ProjectedRankingProduct[]> {

  const {

    projection,

  } = await getRankingRuntime(

    slug

  )

  return projection.products
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchRankingProducts