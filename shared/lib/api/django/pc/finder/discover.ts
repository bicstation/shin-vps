// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder/discover.ts
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder → Discover Continuity
 * ============================================================================
 *
 * PURPOSE:
 *   - finder narrowing continuity
 *   - discover traversal continuity
 *   - semantic traversal-safe handoff
 *
 * IMPORTANT:
 *   - frontend does NOT generate semantic meaning
 *   - backend remains semantic traversal authority
 *   - adapter remains continuity authority
 *
 * RESPONSIBILITIES:
 *   - narrowing → traversal continuity
 *   - discover route continuity stabilization
 *   - workflow-safe traversal handoff
 *   - topology-safe continuity shaping
 *
 * PROHIBITED:
 *   - traversal invention
 *   - graph generation
 *   - semantic inference
 *   - workflow fabrication
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  FinderRuntimeResponse,

} from './contracts'

/* ============================================================================
🔥 Clusters
============================================================================ */

import {

  resolveWorkflowCluster,

} from './clusters'

/* ============================================================================
🔥 Discover Continuity
============================================================================ */

/**
 * Canonical discover continuity runtime.
 */

export interface DiscoverContinuity {

  /**
   * Canonical workflow slug.
   */

  workflow: string

  /**
   * Frontend traversal continuity path.
   */

  path: string

  /**
   * Optional traversal continuity label.
   */

  label?: string
}

/* ============================================================================
🔥 Resolve Discover Continuity
============================================================================ */

/**
 * Resolve finder runtime
 * into discover traversal continuity.
 *
 * IMPORTANT:
 * Adapter stabilizes continuity ONLY.
 *
 * Backend remains:
 * semantic traversal authority.
 */

export function resolveDiscoverContinuity(

  runtime:
    FinderRuntimeResponse

): DiscoverContinuity[] {

  /* ========================================================================
  🔥 Workflow Tags
  ======================================================================== */

  const workflowTags =

    runtime.workflow_tags

    || []

  /* ========================================================================
  🔥 Next Shelves
  ======================================================================== */

  const nextShelves =

    runtime.next_shelves

    || []

  /* ========================================================================
  🔥 Merge Continuity
  ======================================================================== */

  const continuity = [

    ...workflowTags,
    ...nextShelves,
  ]

  /* ========================================================================
  🔥 Normalize
  ======================================================================== */

  const unique = [

    ...new Set(
      continuity
    ),
  ]

  /* ========================================================================
  🔥 Build Discover Continuity
  ======================================================================== */

  return unique.map((workflow) => {

    const normalized =

      resolveWorkflowCluster(
        workflow
      )

      || workflow

    return {

      workflow:
        normalized,

      path:
        `/discover/${normalized}/`,

      label:

        normalized
          .replaceAll(
            '_',
            ' '
          )
          .replaceAll(
            '-',
            ' '
          ),
    }
  })
}

/* ============================================================================
🔥 Resolve Primary Discover Continuity
============================================================================ */

/**
 * Resolve primary discover traversal continuity.
 */

export function resolvePrimaryDiscoverContinuity(

  runtime:
    FinderRuntimeResponse

): DiscoverContinuity | null {

  const continuity =

    resolveDiscoverContinuity(
      runtime
    )

  return (
    continuity[0]
    || null
  )
}