// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder/runtime.ts
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Runtime Builder
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic narrowing runtime stabilization
 *   - traversal-safe runtime shaping
 *   - continuity-safe runtime defaults
 *
 * IMPORTANT:
 *   - frontend does NOT generate semantic meaning
 *   - backend remains semantic authority
 *   - adapter remains continuity authority
 *
 * RESPONSIBILITIES:
 *   - runtime continuity stabilization
 *   - safe semantic runtime shaping
 *   - traversal-safe runtime defaults
 *   - discover continuity preservation
 *
 * PROHIBITED:
 *   - semantic inference
 *   - traversal generation
 *   - graph mutation
 *   - semantic scoring invention
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  FinderRuntimeResponse,
  FinderProductRuntime,
  FinderRuntimeMeta,

} from './contracts'

/* ============================================================================
🔥 Build Finder Runtime
============================================================================ */

/**
 * Build canonical finder runtime.
 *
 * IMPORTANT:
 * Adapter preserves backend semantic truth.
 *
 * Adapter stabilizes ONLY:
 * - runtime continuity
 * - transport safety
 * - traversal-safe defaults
 */

export function buildFinderRuntime(

  runtime?:
    Partial<FinderRuntimeResponse>

): FinderRuntimeResponse {

  /* ========================================================================
  🔥 Results
  ======================================================================== */

  const results =

    Array.isArray(
      runtime?.results
    )

      ? runtime!.results

      : []

  /* ========================================================================
  🔥 Runtime Meta
  ======================================================================== */

  const meta =

    buildRuntimeMeta(
      runtime?.meta,
      results,
    )

  /* ========================================================================
  🔥 Workflow Tags
  ======================================================================== */

  const workflowTags =

    Array.isArray(
      runtime?.workflow_tags
    )

      ? runtime!.workflow_tags

      : []

  /* ========================================================================
  🔥 Next Shelves
  ======================================================================== */

  const nextShelves =

    Array.isArray(
      runtime?.next_shelves
    )

      ? runtime!.next_shelves

      : []

  /* ========================================================================
  🔥 Continuation
  ======================================================================== */

  const continuation =

    Array.isArray(
      runtime?.continuation
    )

      ? runtime!.continuation

      : []

  /* ========================================================================
  🔥 Return
  ======================================================================== */

  return {

    meta,

    results,

    continuation,

    workflow_tags:
      workflowTags,

    next_shelves:
      nextShelves,

    semantic_runtime:

      runtime?.semantic_runtime
      || {},

    adaptive_runtime:

      runtime?.adaptive_runtime
      || {},
  }
}

/* ============================================================================
🔥 Build Runtime Meta
============================================================================ */

/**
 * Build traversal-safe runtime meta.
 */

export function buildRuntimeMeta(

  meta?:
    Partial<FinderRuntimeMeta>,

  results:
    FinderProductRuntime[] = [],

): FinderRuntimeMeta {

  return {

    total_products:

      meta?.total_products
      || results.length,

    returned_results:

      meta?.returned_results
      || results.length,

    usage_weights:

      meta?.usage_weights
      || {},

    budget_max:

      meta?.budget_max
      ?? null,

    fallback_mode:

      meta?.fallback_mode
      || false,
  }
}

/* ============================================================================
🔥 Empty Finder Runtime
============================================================================ */

/**
 * Canonical empty finder runtime.
 */

export function createEmptyFinderRuntime():

FinderRuntimeResponse {

  return {

    meta: {

      total_products:
        0,

      returned_results:
        0,

      usage_weights:
        {},

      budget_max:
        null,

      fallback_mode:
        false,
    },

    results: [],

    continuation: [],

    workflow_tags: [],

    next_shelves: [],

    semantic_runtime: {},

    adaptive_runtime: {},
  }
}

/* ============================================================================
🔥 Runtime Health
============================================================================ */

/**
 * Resolve finder runtime continuity health.
 */

export function resolveFinderRuntimeHealth(

  runtime:
    FinderRuntimeResponse

): 'healthy'
 | 'degraded'
 | 'empty' {

  /* ========================================================================
  🔥 Results
  ======================================================================== */

  const results =

    runtime.results
    || []

  /* ========================================================================
  🔥 Empty Runtime
  ======================================================================== */

  if (
    results.length === 0
  ) {

    return 'empty'
  }

  /* ========================================================================
  🔥 Fallback Runtime
  ======================================================================== */

  if (
    runtime.meta?.fallback_mode
  ) {

    return 'degraded'
  }

  /* ========================================================================
  🔥 Healthy Runtime
  ======================================================================== */

  return 'healthy'
}


