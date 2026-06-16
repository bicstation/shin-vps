// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder/normalize.ts
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Runtime Normalize
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic narrowing runtime normalization
 *   - backend → frontend continuity stabilization
 *   - traversal-safe runtime shaping
 *
 * IMPORTANT:
 *   - frontend does NOT generate semantic meaning
 *   - backend remains semantic authority
 *   - adapter remains continuity authority
 *
 * RESPONSIBILITIES:
 *   - runtime continuity normalization
 *   - semantic payload stabilization
 *   - traversal continuity preservation
 *   - discover handoff continuity shaping
 *
 * PROHIBITED:
 *   - semantic inference
 *   - graph generation
 *   - workflow invention
 *   - semantic scoring fabrication
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  FinderRuntimeResponse,
  FinderProductRuntime,

} from './contracts'

/* ============================================================================
🔥 Runtime
============================================================================ */

import {

  buildFinderRuntime,

} from './runtime'

/* ============================================================================
🔥 Discover Continuity
============================================================================ */

import {

  resolveDiscoverContinuity,

} from './discover'

/* ============================================================================
🔥 Normalize Finder Runtime
============================================================================ */

/**
 * Normalize backend semantic narrowing runtime.
 *
 * IMPORTANT:
 * Adapter preserves backend semantic truth.
 *
 * Adapter stabilizes ONLY:
 * - continuity
 * - traversal safety
 * - frontend runtime coherence
 */

export function normalizeFinderRuntime(

  runtime:
    Partial<FinderRuntimeResponse>

): FinderRuntimeResponse {

  /* ========================================================================
  🔥 Safe Results
  ======================================================================== */
  const source =
    runtime?.data ?? runtime

  const rawResults =

    Array.isArray(
      source?.products
    )

      ? source.products

      : Array.isArray(
          source?.results
        )

        ? source.results

        : []
  
  console.log(
    '🔥 RAW RESULTS',
    rawResults.length,
    rawResults?.[0]
  )

  /* ========================================================================
  🔥 Normalize Products
  ======================================================================== */
  console.log(
    '🔥 RAW RESULTS',
    rawResults?.length,
    rawResults?.[0]
  )

  const results =

    rawResults.map(
      normalizeFinderProduct
    )
  
  console.log(
    '🔥 NORMALIZED PRODUCT',
    results?.[0]
  )

  /* ========================================================================
  🔥 Runtime Build
  ======================================================================== */

  const normalized =

    buildFinderRuntime({

      ...runtime,

      results,
    })

  /* ========================================================================
  🔥 Discover Continuity
  ======================================================================== */

  const discoverContinuity =

    resolveDiscoverContinuity(
      normalized
    )

  /* ========================================================================
  🔥 Return
  ======================================================================== */

  return {

    ...normalized,

    /**
     * Continuity-safe discover traversal.
     */
    
    next_shelves:

      runtime.next_shelves

      || discoverContinuity.map(
        (continuity) =>
          continuity.workflow
      ),
  }
}

/* ============================================================================
🔥 Normalize Finder Product
============================================================================ */

/**
 * Normalize semantic narrowing product runtime.
 */

export function normalizeFinderProduct(

  item:
    Partial<FinderProductRuntime>

): FinderProductRuntime {

  /* ========================================================================
  🔥 Product
  ======================================================================== */

  const product =

    typeof item?.product === 'object'
      ? item.product
      : item

  /* ========================================================================
  🔥 Semantic Runtime
  ======================================================================== */

  const semantic =

    item.semantic

    || {}

  /* ========================================================================
  🔥 Return
  ======================================================================== */

  return {

    product: {

      id:
        product.id
        || 0,

      unique_id:
        product.unique_id,

      name:
        product.name,

      image_url:
        product.image_url,

      semantic_labels:

        Array.isArray(
          product.semantic_labels
        )

          ? product.semantic_labels

          : [],

      price:
        product.price,
    },

    semantic: {

      score:
        semantic.score
        || 0,

      confidence:
        semantic.confidence
        || 0,

      reasons:

        Array.isArray(
          semantic.reasons
        )

          ? semantic.reasons

          : [],

      breakdown:
        semantic.breakdown
        || {},
    },
  }
}