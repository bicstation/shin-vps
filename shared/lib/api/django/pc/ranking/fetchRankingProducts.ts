// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/fetchRankingProducts.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

import type {

  SemanticRankingRuntime,

} from './contracts'

import {

  buildEndpoint,

} from '../utils/buildEndpoint'

import {

  safeFetch,

} from '../utils/safeFetch'

import {

  normalizeRanking,

} from './normalize'

const RANKING_ENDPOINT =

  '/pc/ranking'

export async function fetchRankingProducts(

  type = 'score',

): Promise<SemanticRankingRuntime> {

  /* ========================================================================
  Empty Guard
  ======================================================================== */

  if (!type) {

    console.warn(

      '⚠️ FETCH RANKING PRODUCTS EMPTY TYPE'

    )

    return normalizeRanking()

  }

  /* ========================================================================
  Endpoint
  ======================================================================== */

  const endpoint =

    buildEndpoint(

      `${RANKING_ENDPOINT}/${type}/`

    )

  /* ========================================================================
  Fetch
  ======================================================================== */

  const payload =

    await safeFetch<SemanticRankingRuntime>(

      endpoint

    )

  console.log(

    '🔥 FETCH RANKING PRODUCTS',

    {

      endpoint,

      payload,

    }

  )

  /* ========================================================================
  Failure
  ======================================================================== */

  if (!payload) {

    console.error(

      '🔥 FETCH RANKING PRODUCTS FAILURE',

      {

        endpoint,

        type,

      }

    )

    return normalizeRanking()

  }

  /* ========================================================================
  Normalize
  ======================================================================== */

  const runtime =

    normalizeRanking(

      payload

    )

  /* ========================================================================
  Runtime Debug
  ======================================================================== */

  console.log(

    '🔥 RANKING RUNTIME',

    {

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

  /* ========================================================================
  Success
  ======================================================================== */

  return runtime

}

export default fetchRankingProducts