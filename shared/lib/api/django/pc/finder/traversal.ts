// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder/traversal.ts
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Traversal Continuity
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic narrowing traversal continuity
 *   - finder → discover traversal stabilization
 *   - traversal-safe continuity shaping
 *
 * IMPORTANT:
 *   - frontend does NOT generate semantic meaning
 *   - backend remains semantic traversal authority
 *   - adapter remains continuity authority
 *
 * RESPONSIBILITIES:
 *   - traversal continuity stabilization
 *   - discover handoff continuity
 *   - narrowing-safe traversal shaping
 *   - topology-safe traversal continuity
 *
 * PROHIBITED:
 *   - graph generation
 *   - semantic inference
 *   - traversal fabrication
 *   - workflow invention
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
🔥 Discover Continuity
============================================================================ */

import type {

  DiscoverContinuity,

} from './discover'

import {

  resolveDiscoverContinuity,

} from './discover'

/* ============================================================================
🔥 Semantic Paths
============================================================================ */

import {

  resolveFinderPath,
  resolveDiscoverPath,

} from './semanticPaths'

/* ============================================================================
🔥 Traversal Edge
============================================================================ */

/**
 * Lightweight traversal-safe edge.
 */

export interface FinderTraversalEdge {

  /**
   * Traversal source path.
   */

  from: string

  /**
   * Traversal destination path.
   */

  to: string

  /**
   * Traversal continuity type.
   */

  relation:
    | 'narrowing'
    | 'workflow'
    | 'discover-handoff'

  /**
   * Optional workflow continuity.
   */

  workflow?: string
}

/* ============================================================================
🔥 Traversal Runtime
============================================================================ */

/**
 * Canonical traversal continuity runtime.
 */

export interface FinderTraversalRuntime {

  /**
   * Current traversal path.
   */

  current: string

  /**
   * Discover traversal continuity.
   */

  discover: DiscoverContinuity[]

  /**
   * Traversal continuity edges.
   */

  edges: FinderTraversalEdge[]

  /**
   * Traversal continuity health.
   */

  continuity:
    | 'healthy'
    | 'degraded'
    | 'empty'
}

/* ============================================================================
🔥 Resolve Finder Traversal
============================================================================ */

/**
 * Resolve semantic traversal continuity runtime.
 *
 * IMPORTANT:
 * Adapter stabilizes traversal continuity ONLY.
 *
 * Backend remains semantic traversal authority.
 */

export function resolveFinderTraversal(

  runtime:
    FinderRuntimeResponse,

  options?: {

    usage?: string
  }

): FinderTraversalRuntime {

  /* ========================================================================
  🔥 Current Finder Path
  ======================================================================== */

  const finderPath =

    resolveFinderPath(
      options?.usage
    )

  /* ========================================================================
  🔥 Discover Continuity
  ======================================================================== */

  const discoverContinuity =

    resolveDiscoverContinuity(
      runtime
    )

  /* ========================================================================
  🔥 Traversal Edges
  ======================================================================== */

  const edges =

    buildTraversalEdges(
      finderPath.path,
      discoverContinuity,
    )

  /* ========================================================================
  🔥 Continuity
  ======================================================================== */

  const continuity =

    resolveTraversalContinuity(
      runtime,
      edges,
    )

  /* ========================================================================
  🔥 Return
  ======================================================================== */

  return {

    current:
      finderPath.path,

    discover:
      discoverContinuity,

    edges,

    continuity,
  }
}

/* ============================================================================
🔥 Build Traversal Edges
============================================================================ */

/**
 * Build traversal-safe continuity edges.
 */

export function buildTraversalEdges(

  currentPath: string,

  continuity:
    DiscoverContinuity[],

): FinderTraversalEdge[] {

  return continuity.map(
    (discover) => {

      const discoverPath =

        resolveDiscoverPath(
          discover.workflow
        )

      return {

        from:
          currentPath,

        to:
          discoverPath.path,

        relation:
          'discover-handoff',

        workflow:
          discover.workflow,
      }
    }
  )
}

/* ============================================================================
🔥 Resolve Traversal Continuity
============================================================================ */

/**
 * Resolve traversal continuity health.
 */

export function resolveTraversalContinuity(

  runtime:
    FinderRuntimeResponse,

  edges:
    FinderTraversalEdge[],

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
  🔥 Missing Traversal Edges
  ======================================================================== */

  if (
    edges.length === 0
  ) {

    return 'degraded'
  }

  /* ========================================================================
  🔥 Healthy Continuity
  ======================================================================== */

  return 'healthy'
}