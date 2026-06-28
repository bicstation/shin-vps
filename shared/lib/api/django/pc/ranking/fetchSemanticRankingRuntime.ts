// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/fetchSemanticRankingRuntime.ts
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

const RANKING_RUNTIME_ENDPOINT =

  '/pc/ranking'

export async function fetchSemanticRankingRuntime(

  slug = 'all',

): Promise<SemanticRankingRuntime> {

  /* ==========================================================================
  Empty Guard
  ========================================================================== */

  if (!slug) {

    console.warn(

      '⚠️ SEMANTIC RANKING RUNTIME EMPTY SLUG'

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

    '🔥 SEMANTIC RANKING RUNTIME FETCH'

  )

  console.log({

    slug,

    endpoint,

    pipeline:

      'ranking-runtime-v2',

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

  console.log(

    '🔥 RANKING RAW PAYLOAD',

    payload

  )

  /* ==========================================================================
  Failure
  ========================================================================== */

  if (!payload) {

    console.error(

      '🔥 SEMANTIC RANKING RUNTIME FAILURE',

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

  /* ==========================================================================
  Success
  ========================================================================== */

  return runtime

}

export default fetchSemanticRankingRuntime