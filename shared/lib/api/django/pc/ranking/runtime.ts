// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/ranking/runtime.ts
// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/ranking/runtime.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Ranking Runtime Pipeline
 *
 * IMPORTANT:
 *
 * This runtime pipeline exists for:
 *
 * semantic collection runtime observability
 *
 * NOT:
 *
 * normalized UI rendering
 *
 * Responsibilities:
 *
 * - raw semantic collection transport
 * - ranking runtime preservation
 * - runtime observability support
 * - semantic authority exposure
 * - discovery runtime inspection
 *
 * IMPORTANT:
 *
 * This pipeline MUST NOT:
 *
 * ❌ rerank semantic collections
 * ❌ infer workflow meaning
 * ❌ mutate traversal semantics
 * ❌ generate grouped exploration
 * ❌ transform semantic runtime meaning
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

  '/general/pc-products/ranking'

/* ============================================================================
🔥 Fetch Ranking Runtime
============================================================================ */

/**
 * Runtime Observatory Pipeline
 *
 * IMPORTANT:
 *
 * Returns:
 *
 * raw semantic ranking runtime payload
 *
 * NOT:
 *
 * normalized ranking structure
 */
export async function fetchRankingRuntime(

  slug = 'score',

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
  // Runtime Debug
  // ======================================

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(

    '🔥 RANKING RUNTIME FETCH START'
  )

  console.log(

    {

      slug,

      endpoint,

      pipeline:
        'semantic-collection-runtime-authority',
    }
  )

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  // ======================================
  // Fetch Runtime
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

      '🔥 RANKING RUNTIME FETCH FAILURE',

      {

        slug,

        endpoint,
      }
    )

    return null
  }

  // ======================================
  // Runtime Payload
  // ======================================

  const rankingResults =

    Array.isArray(
      (response as any)
        ?.ranking?.results
    )

      ? (response as any)
          .ranking
          .results

      : []

  // ======================================
  // Semantic Runtime Debug
  // ======================================

  console.log(

    '🔥 RANKING RUNTIME RESPONSE',

    {

      slug,

      endpoint,

      semantic_schema_version:

        (response as any)
          ?.semantic_schema_version,

      has_semantic_runtime:

        !!(response as any)
          ?.semantic_runtime,

      has_workflow_tags:

        Array.isArray(
          (response as any)
            ?.workflow_tags
        ),

      has_grouped_attributes:

        !!(response as any)
          ?.grouped_attributes,

      result_count:

        rankingResults.length,

      payload_keys:

        Object.keys(
          response || {}
        ),

      payload:
        response,
    }
  )

  // ======================================
  // Success
  // ======================================

  return response
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchRankingRuntime