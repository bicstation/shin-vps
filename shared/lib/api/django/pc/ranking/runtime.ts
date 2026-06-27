// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/ranking/runtime.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Runtime Gateway
 * ============================================================================
 *
 * PURPOSE
 *
 * GET /api/pc/ranking/{slug}/
 *
 * ↓
 *
 * Semantic Ranking Runtime
 *
 * IMPORTANT
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Projection Authority
 *
 * Adapter SHALL:
 *
 * Transport
 * Normalize
 * Project
 * Observe
 *
 * ONLY
 *
 * ============================================================================
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

const RANKING_RUNTIME_ENDPOINT =

  '/pc/ranking'

/* ============================================================================
🔥 Fetch Ranking Runtime
============================================================================ */

export async function fetchRankingRuntime(

  slug = 'usage-gaming',

): Promise<SemanticRankingRuntime> {

  /* ==========================================================================
  Empty Guard
  ========================================================================== */

  if (!slug) {

    console.warn(

      '⚠️ RANKING RUNTIME EMPTY SLUG'

    )

    return normalizeRanking()

  }

  /* ==========================================================================
  Endpoint
  ========================================================================== */

  const endpoint =

    buildEndpoint(

      `${RANKING_RUNTIME_ENDPOINT}/${slug}/`

    )

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

  )

  console.log(

    '🔥 FETCH RANKING RUNTIME'

  )

  console.log({

    slug,

    endpoint,

  })

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

  )

  /* ==========================================================================
  Fetch
  ========================================================================== */

  const payload =

    await safeFetch<SemanticRankingRuntime>(

      endpoint

    )

  /* ==========================================================================
  Failure
  ========================================================================== */

  if (!payload) {

    console.error(

      '🔥 RANKING RUNTIME FAILURE',

      {

        slug,

        endpoint,

      }

    )

    return normalizeRanking()

  }

  /* ==========================================================================
  Normalize
  ========================================================================== */

  const runtime =

    normalizeRanking(

      payload

    )

  /* ==========================================================================
  Runtime Observability
  ========================================================================== */

  console.log(

    '🔥 RANKING RUNTIME',

    {

      slug,

      endpoint,

      presentation:

        runtime.presentation,

      products:

        runtime.products?.length,

      ranking:

        runtime.ranking?.results?.length,

      semantic_schema_version:

        runtime.semantic_schema_version,

      authority_version:

        runtime.authority_version,

      semantic_authority:

        runtime.semantic_authority,

      ready:

        runtime.ready,

    }

  )

  /* ==========================================================================
  Success
  ========================================================================== */

  return runtime

}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchRankingRuntime