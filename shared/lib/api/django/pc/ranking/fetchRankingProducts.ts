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

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

  )

  console.log(

    '🔥 FETCH RANKING PRODUCTS'

  )

  console.log({

    type,

    endpoint,

  })

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

  )

  /* ========================================================================
  Fetch
  ======================================================================== */

  const payload =

    await safeFetch<SemanticRankingRuntime>(

      endpoint

    )

  /* ========================================================================
  Failure
  ======================================================================== */

  if (!payload) {

    console.error(

      '🔥 FETCH RANKING PRODUCTS FAILURE',

      {

        type,

        endpoint,

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
  Runtime Observability
  ======================================================================== */

  console.log(

    '🔥 RANKING RUNTIME',

    {

      type,

      endpoint,

      meaning:

        runtime.meaning,

      presentation:

        runtime.presentation,

      seo:

        runtime.seo,

      runtime:

        runtime.runtime,

      ranking: {

        group_slug:

          runtime.ranking?.group_slug,

        group_name:

          runtime.ranking?.group_name,

        product_count:

          runtime.ranking?.product_count,

        results:

          runtime.ranking?.results?.length,

      },

      products:

        runtime.products?.length,

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