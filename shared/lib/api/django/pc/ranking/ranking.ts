// ============================================================================
// Ranking Runtime Gateway V2
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

/* ============================================================================
🔥 Endpoint
============================================================================ */

const RANKING_ENDPOINT =

  '/pc/ranking'

/* ============================================================================
🔥 Fetch Ranking Runtime
============================================================================ */

export async function fetchRanking(

  slug: string

): Promise<SemanticRankingRuntime> {

  /* ------------------------------------------------------------------------
  Endpoint
  ------------------------------------------------------------------------ */

  const endpoint =

    buildEndpoint(

      `${RANKING_ENDPOINT}/${slug}/`

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

  /* ------------------------------------------------------------------------
  Fetch
  ------------------------------------------------------------------------ */

  const payload =

    await safeFetch<SemanticRankingRuntime>(

      endpoint

    )

  console.log(

    '🔥 RANKING RAW PAYLOAD',

    payload

  )

  /* ------------------------------------------------------------------------
  Empty
  ------------------------------------------------------------------------ */

  if (!payload) {

    console.warn(

      '⚠️ RANKING RUNTIME EMPTY'

    )

    return normalizeRanking()
  }

  /* ------------------------------------------------------------------------
  Normalize
  ------------------------------------------------------------------------ */

  const runtime =

    normalizeRanking(

      payload

    )

  /* ------------------------------------------------------------------------
  Observatory
  ------------------------------------------------------------------------ */

  console.log(

    '🔥 RANKING RUNTIME',

    {

      title:

        runtime.presentation?.title,

      group:

        runtime.data.group_slug,

      count:

        runtime.data.product_count,

      products:

        runtime.data.products.length,

      semantic_schema_version:

        runtime.semantic_schema_version,

      authority_version:

        runtime.authority_version,

      semantic_authority:

        runtime.semantic_authority,

      ready:

        runtime.ready,

      sample:

        runtime.data.products[0],

    }

  )

  /* ------------------------------------------------------------------------
  Return
  ------------------------------------------------------------------------ */

  return runtime
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchRanking