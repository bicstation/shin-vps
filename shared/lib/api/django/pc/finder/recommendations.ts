// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder/recommendations.ts
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Recommendation Continuity
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic narrowing recommendation continuity
 *   - traversal-safe recommendation shaping
 *   - discover handoff continuity support
 *
 * IMPORTANT:
 *   - frontend does NOT generate semantic meaning
 *   - backend remains semantic authority
 *   - adapter remains continuity authority
 *
 * RESPONSIBILITIES:
 *   - recommendation continuity stabilization
 *   - traversal-safe recommendation shaping
 *   - semantic runtime preservation
 *   - discover continuity support
 *
 * PROHIBITED:
 *   - semantic inference
 *   - graph generation
 *   - traversal fabrication
 *   - workflow invention
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  FinderProductRuntime,
  FinderRuntimeResponse,

} from './contracts'

/* ============================================================================
🔥 Discover Continuity
============================================================================ */

import {

  resolvePrimaryDiscoverContinuity,

} from './discover'

/* ============================================================================
🔥 Recommendation Runtime
============================================================================ */

/**
 * Lightweight recommendation continuity runtime.
 */

export interface FinderRecommendation {

  /**
   * Canonical semantic runtime product.
   */

  product: FinderProductRuntime

  /**
   * Lightweight recommendation continuity score.
   *
   * IMPORTANT:
   * Preserves backend semantic runtime ONLY.
   */

  score: number

  /**
   * Optional traversal continuity.
   */

  discover_path?: string

  /**
   * Optional workflow continuity.
   */

  workflow?: string
}

/* ============================================================================
🔥 Build Recommendations
============================================================================ */

/**
 * Build traversal-safe finder recommendations.
 *
 * IMPORTANT:
 * Adapter preserves backend semantic truth.
 *
 * Adapter does NOT:
 * - invent semantic ranking
 * - generate semantic scoring
 * - fabricate traversal topology
 */

export function buildFinderRecommendations(

  runtime:
    FinderRuntimeResponse

): FinderRecommendation[] {

  /* ========================================================================
  🔥 Results
  ======================================================================== */

  const results =

    Array.isArray(
      runtime.results
    )

      ? runtime.results

      : []

  /* ========================================================================
  🔥 Discover Continuity
  ======================================================================== */

  const discoverContinuity =

    resolvePrimaryDiscoverContinuity(
      runtime
    )

  /* ========================================================================
  🔥 Recommendations
  ======================================================================== */

  return results.map((product) => {

    /* ======================================================================
    🔥 Backend Semantic Runtime
    ====================================================================== */

    const semantic =

      product.semantic
      || {}

    /* ======================================================================
    🔥 Preserve Backend Score
    ====================================================================== */

    const score =

      semantic.score
      || 0

    /* ======================================================================
    🔥 Return
    ====================================================================== */

    return {

      product,

      score,

      workflow:
        discoverContinuity?.workflow,

      discover_path:
        discoverContinuity?.path,
    }
  })
}

/* ============================================================================
🔥 Resolve Primary Recommendation
============================================================================ */

/**
 * Resolve primary recommendation continuity.
 */

export function resolvePrimaryRecommendation(

  runtime:
    FinderRuntimeResponse

): FinderRecommendation | null {

  const recommendations =

    buildFinderRecommendations(
      runtime
    )

  return (
    recommendations[0]
    || null
  )
}

/* ============================================================================
🔥 Filter Recommendations
============================================================================ */

/**
 * Filter traversal-safe recommendations.
 *
 * IMPORTANT:
 * Adapter performs ONLY:
 * lightweight continuity-safe filtering.
 */

export function filterRecommendations(

  recommendations:
    FinderRecommendation[],

  minimumScore = 1

): FinderRecommendation[] {

  return recommendations.filter(
    (recommendation) => (

      recommendation.score
      >= minimumScore
    )
  )
}