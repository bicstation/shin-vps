// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder/observatory.ts
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Runtime Observatory
 * ============================================================================
 *
 * IMPORTANT:
 *
 * Observatory layer exists ONLY for:
 *
 * - runtime visibility
 * - transport inspection
 * - traversal continuity inspection
 * - semantic runtime observability
 *
 * NOT:
 *
 * - semantic meaning generation
 * - traversal meaning generation
 * - recommendation meaning generation
 *
 * Backend remains:
 *
 * semantic traversal authority
 *
 * Adapter remains:
 *
 * continuity authority
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  FinderRuntimeResponse,

} from './contracts'

/* ============================================================================
🔥 Runtime Observatory
============================================================================ */

export function
logFinderRuntime(

  runtime:
    FinderRuntimeResponse

): void {

  /* ========================================================================
  🔥 Runtime Observatory
  ======================================================================== */

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 FINDER RUNTIME INITIALIZED'
  )

  console.log({

    success:
      runtime.success,

    total:

      runtime.meta
        ?.total_products

      || runtime.results
        ?.length

      || 0,

    semanticRuntime:
      runtime.semantic_runtime,

    adaptiveRuntime:
      runtime.adaptive_runtime,

    workflowTags:
      runtime.workflow_tags,

    nextShelves:
      runtime.next_shelves,

    runtimeStatus:
      runtime.runtime_status,

    resultCount:

      runtime.results
        ?.length

      || 0,
  })

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )
}

/* ============================================================================
🔥 Runtime Transport Observatory
============================================================================ */

export function
logFinderTransport(

  payload: unknown

): void {

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 FINDER TRANSPORT'
  )

  console.log(
    payload
  )

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )
}

/* ============================================================================
🔥 Runtime Error Observatory
============================================================================ */

export function
logFinderError(

  error: unknown

): void {

  console.error(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.error(
    '🔥 FINDER RUNTIME ERROR'
  )

  console.error(
    error
  )

  console.error(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )
}