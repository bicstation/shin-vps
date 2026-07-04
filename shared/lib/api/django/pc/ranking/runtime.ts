// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/runtime.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Runtime Facade
 * ============================================================================
 *
 * Responsibilities
 *
 * - Runtime Orchestration
 *
 * NOT
 *
 * - Runtime Fetch
 * - Runtime Normalize
 * - Runtime Composition
 * - Runtime Projection
 * - Semantic Authority
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Runtime Facade
 *
 * ============================================================================
 */

import type {

  SemanticRankingRuntime,

} from './contracts'

import {

  fetchRanking,

} from './ranking'

import {

  normalizeRankingRuntime,

} from './normalize'

import {

  composeRankingRuntime,

} from './composition'

import {

  projectRankingRuntime,

  type ProjectedRankingExperienceRuntime,

} from './projection'

import {

  getNavigationRuntime,

} from '../navigation/runtime'

/* ============================================================================
🔥 Runtime Result
============================================================================ */

export interface RankingRuntimeResult {

  runtime: SemanticRankingRuntime

  projection: ProjectedRankingExperienceRuntime

}

/* ============================================================================
🔥 Runtime Facade
============================================================================ */

export async function getRankingRuntime(

  slug: string,

): Promise<RankingRuntimeResult> {

  /* ------------------------------------------------------------------------
  Ranking Runtime
  ------------------------------------------------------------------------ */

  const ranking =

    await fetchRanking(

      slug

    )

  /* ------------------------------------------------------------------------
  Navigation Runtime
  ------------------------------------------------------------------------ */

  const navigation =

    await getNavigationRuntime()

  /* ------------------------------------------------------------------------
  Normalize
  ------------------------------------------------------------------------ */

  const normalized =

    normalizeRankingRuntime(

      ranking

    )

  /* ------------------------------------------------------------------------
  Composition
  ------------------------------------------------------------------------ */

  const composed =

    composeRankingRuntime(

      navigation,

      normalized,

    )

  /* ------------------------------------------------------------------------
  Projection
  ------------------------------------------------------------------------ */

  const projection =

    projectRankingRuntime(

      composed.ranking

    )

  /* ------------------------------------------------------------------------
  Return
  ------------------------------------------------------------------------ */

  return {

    runtime:

      composed.ranking,

    projection,

  }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchProjectedRankingRuntime =

  getRankingRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default getRankingRuntime