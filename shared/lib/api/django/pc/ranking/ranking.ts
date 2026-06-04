// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/ranking/ranking.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Ranking Collection Gateway
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * frontend-safe semantic collection exposure
 *
 * NOT:
 *
 * semantic ranking generation
 *
 * Responsibilities:
 *
 * - ranking runtime fetch
 * - shallow-safe collection stabilization
 * - semantic runtime preservation
 * - frontend-safe ranking exposure
 *
 * IMPORTANT:
 *
 * This layer MUST NOT:
 *
 * ❌ rerank semantic collections
 * ❌ infer workflow meaning
 * ❌ generate semantic labels
 * ❌ mutate traversal semantics
 * ❌ generate grouped exploration
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
🔥 Fetch Ranking
============================================================================ */

/**
 * Frontend-safe ranking gateway.
 *
 * IMPORTANT:
 *
 * This layer intentionally avoids:
 *
 * - semantic inference
 * - workflow mutation
 * - traversal generation
 * - exploration rewriting
 *
 * Backend remains semantic authority.
 */
export async function fetchRanking(

  slug = 'score',

): Promise<SemanticRankingRuntime | null> {

  // ======================================
  // Empty Guard
  // ======================================

  if (!slug) {

    console.warn(

      '⚠️ RANKING EMPTY SLUG'
    )

    return null
  }

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    buildEndpoint(

      `${RANKING_ENDPOINT}/${slug}/`

    )

  // ======================================
  // Fetch
  // ======================================

  const response =

    await safeFetch<SemanticRankingRuntime>(
      endpoint
    )

  // ======================================
  // Invalid Response
  // ======================================

  if (!response) {

    console.error(

      '🔥 RANKING FETCH FAILURE',

      {

        slug,

        endpoint,
      }
    )

    return null
  }

  // ======================================
  // Runtime Debug
  // ======================================

  console.log(

    '🔥 RANKING ENDPOINT:',

    endpoint
  )

  console.log(

    '🔥 RANKING RESPONSE:',

    response
  )

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

export default fetchRanking