// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/ranking/fetchRankingProducts.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Legacy Ranking Transport
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * legacy ranking compatibility
 *
 * NOT:
 *
 * semantic runtime governance
 *
 * Responsibilities:
 *
 * - legacy ranking transport
 * - compatibility continuity
 * - lightweight collection stabilization
 *
 * IMPORTANT:
 *
 * New runtime authority lives in:
 *
 * ./runtime
 * ./ranking
 * ./normalize
 * ./contracts
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  SemanticRankingRuntime,

} from './contracts'

/* ============================================================================
🔥 Utils
============================================================================ */

import {

  buildEndpoint,

} from '../utils/buildEndpoint'

import {

  safeFetch,

} from '../utils/safeFetch'

/* ============================================================================
🔥 Normalize
============================================================================ */

import {

  normalizeRanking,

} from './normalize'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const RANKING_ENDPOINT =

  '/general/pc-products/ranking'

/* ============================================================================
🔥 Fetch Ranking Products
============================================================================ */

/**
 * Legacy-compatible ranking fetch.
 *
 * IMPORTANT:
 *
 * This layer intentionally avoids:
 *
 * - semantic inference
 * - workflow mutation
 * - traversal generation
 * - ranking rewriting
 *
 * Backend remains semantic authority.
 */
export async function fetchRankingProducts(

  type = 'score',

): Promise<SemanticRankingRuntime | null> {

  // ======================================
  // Empty Guard
  // ======================================

  if (!type) {

    console.warn(

      '⚠️ FETCH RANKING PRODUCTS EMPTY TYPE'
    )

    return null
  }

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    buildEndpoint(

      `${RANKING_ENDPOINT}/${type}/`

    )

  // ======================================
  // Fetch
  // ======================================

  const response =

    await safeFetch<SemanticRankingRuntime>(
      endpoint
    )

  // ======================================
  // Runtime Debug
  // ======================================

  console.log(

    '🔥 FETCH RANKING PRODUCTS URL',

    endpoint
  )

  console.log(

    '🔥 FETCH RANKING PRODUCTS RAW',

    response
  )

  // ======================================
  // Invalid Response
  // ======================================

  if (!response) {

    console.error(

      '🔥 FETCH RANKING PRODUCTS FAILURE',

      {

        type,

        endpoint,
      }
    )

    return {

      success: false,

      ranking: {

        results: [],
      },

      raw: null,
    }
  }

  // ======================================
  // Normalize
  // ======================================

  return normalizeRanking(

    response

  )
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchRankingProducts