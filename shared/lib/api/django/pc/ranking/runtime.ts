// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/ranking/runtime.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Ranking Runtime Gateway
 *
 * Responsibilities:
 *
 * - ranking runtime fetch
 * - backend runtime preservation
 * - frontend-safe runtime exposure
 *
 * IMPORTANT:
 *
 * Backend remains semantic authority.
 * This layer MUST NOT:
 *
 * ❌ rerank products
 * ❌ generate semantic meaning
 * ❌ mutate workflow tags
 * ❌ modify semantic labels
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
🔥 Endpoint
============================================================================ */

const RANKING_RUNTIME_ENDPOINT =
  '/pc/ranking'

/* ============================================================================
🔥 Fetch Ranking Runtime
============================================================================ */

export async function fetchRankingRuntime(

  slug: string = 'usage-gaming',

): Promise<SemanticRankingRuntime | null> {

  // ======================================
  // Empty Guard
  // ======================================

  if (!slug) {

    console.warn(
      '⚠️ RANKING RUNTIME EMPTY SLUG'
    )

    return null
  }

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    buildEndpoint(
      `${RANKING_RUNTIME_ENDPOINT}/${slug}/`
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
      '🔥 RANKING RUNTIME FAILURE',
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

  const source =

    (response as any)?.data

    ??

    response

    ??

    {}

  console.log(
    '🔥 RANKING RUNTIME',
    {

      slug,

      endpoint,

      group_slug:
        source?.group_slug,

      group_name:
        source?.group_name,

      product_count:

        source?.product_count

        ??

        source?.products?.length

        ??

        0,
    }
  )

  // ======================================
  // Return
  // ======================================

  return response
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchRankingRuntime