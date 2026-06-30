// ============================================================================
// FILE:
// fetchSemanticRankingRuntime.ts
// SHIN CORE LINX
// Legacy Compatibility Layer
// ============================================================================

import type {

  SemanticRankingRuntime,

} from './contracts'

import {

  getRankingRuntime,

} from './runtime'

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

/**
 * Legacy API
 *
 * Runtime
 * ↓
 * Projection
 *
 * Runtimeのみ返却
 */

export async function fetchSemanticRankingRuntime(

  slug: string

): Promise<SemanticRankingRuntime> {

  const {

    runtime,

  } = await getRankingRuntime(

    slug

  )

  return runtime
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchSemanticRankingRuntime