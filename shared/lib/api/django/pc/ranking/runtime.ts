// ============================================================================
// Ranking Runtime V2
// ============================================================================

import type {

  SemanticRankingRuntime,

} from './contracts'

import {

  fetchRanking,

} from './ranking'

import {

  projectRankingRuntime,

} from './projection'

/* ============================================================================
🔥 Runtime Result
============================================================================ */

export interface RankingRuntimeResult {

  runtime: SemanticRankingRuntime

  projection: ReturnType<typeof projectRankingRuntime>
}

/* ============================================================================
🔥 Get Ranking Runtime
============================================================================ */

export async function getRankingRuntime(

  slug: string

): Promise<RankingRuntimeResult> {

  /* ------------------------------------------------------------------------
  Runtime
  ------------------------------------------------------------------------ */

  const runtime =

    await fetchRanking(

      slug

    )

  /* ------------------------------------------------------------------------
  Projection
  ------------------------------------------------------------------------ */

  const projection =

    projectRankingRuntime(

      runtime

    )

  /* ------------------------------------------------------------------------
  Return
  ------------------------------------------------------------------------ */

  return {

    runtime,

    projection,

  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default getRankingRuntime