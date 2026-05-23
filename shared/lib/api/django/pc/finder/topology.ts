// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder/topology.ts
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Traversal Topology
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic narrowing topology continuity
 *   - traversal-safe runtime topology shaping
 *   - finder → discover topology continuity
 *
 * IMPORTANT:
 *   - frontend does NOT generate semantic meaning
 *   - backend remains semantic traversal authority
 *   - adapter remains continuity authority
 *
 * RESPONSIBILITIES:
 *   - traversal continuity stabilization
 *   - narrowing topology shaping
 *   - discover handoff topology continuity
 *   - topology-safe runtime normalization
 *
 * PROHIBITED:
 *   - graph generation
 *   - traversal fabrication
 *   - semantic inference
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
🔥 Finder Topology Node
============================================================================ */

/**
 * Lightweight traversal-safe topology node.
 */

export interface FinderTopologyNode {

  /**
   * Canonical topology identifier.
   */

  id: string

  /**
   * Human traversal continuity label.
   */

  label: string

  /**
   * Traversal continuity path.
   */

  path: string

  /**
   * Traversal runtime phase.
   */

  phase:
    | 'finder'
    | 'discover'

  /**
   * Optional workflow continuity.
   */

  workflow?: string

  /**
   * Optional usage continuity.
   */

  usage?: string
}

/* ============================================================================
🔥 Finder Topology Runtime
============================================================================ */

/**
 * Traversal-safe topology runtime.
 */

export interface FinderTopologyRuntime {

  /**
   * Current narrowing topology node.
   */

  current: FinderTopologyNode

  /**
   * Discover traversal continuity nodes.
   */

  next: FinderTopologyNode[]

  /**
   * Optional traversal continuity health.
   */

  continuity:
    | 'healthy'
    | 'degraded'
    | 'empty'
}

/* ============================================================================
🔥 Resolve Finder Topology
============================================================================ */

/**
 * Resolve semantic traversal topology continuity.
 *
 * IMPORTANT:
 * Adapter stabilizes topology continuity ONLY.
 *
 * Backend remains traversal authority.
 */

export function resolveFinderTopology(

  runtime:
    FinderRuntimeResponse,

  options?: {

    usage?: string

    workflow?: string
  }

): FinderTopologyRuntime {

  /* ========================================================================
  🔥 Current Finder Path
  ======================================================================== */

  const finderPath =

    resolveFinderPath(
      options?.usage
    )

  /* ========================================================================
  🔥 Current Node
  ======================================================================== */

  const current: FinderTopologyNode = {

    id:

      finderPath.usage
      || 'finder',

    label:

      finderPath.label
      || 'finder',

    path:
      finderPath.path,

    phase:
      'finder',

    usage:
      finderPath.usage,
  }

  /* ========================================================================
  🔥 Discover Continuity
  ======================================================================== */

  const discoverContinuity =

    resolveDiscoverContinuity(
      runtime
    )

  /* ========================================================================
  🔥 Next Traversal Nodes
  ======================================================================== */

  const next =

    discoverContinuity.map(
      (continuity) => {

        const discoverPath =

          resolveDiscoverPath(
            continuity.workflow
          )

        return {

          id:
            continuity.workflow,

          label:

            discoverPath.label
            || continuity.workflow,

          path:
            discoverPath.path,

          phase:
            'discover',

          workflow:
            continuity.workflow,
        }
      }
    )

  /* ========================================================================
  🔥 Continuity Health
  ======================================================================== */

  const continuity =

    resolveTopologyContinuity(
      runtime,
      next,
    )

  /* ========================================================================
  🔥 Return
  ======================================================================== */

  return {

    current,

    next,

    continuity,
  }
}

/* ============================================================================
🔥 Resolve Topology Continuity
============================================================================ */

/**
 * Resolve traversal continuity health.
 */

export function resolveTopologyContinuity(

  runtime:
    FinderRuntimeResponse,

  next:
    FinderTopologyNode[],

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
  🔥 Missing Traversal Continuity
  ======================================================================== */

  if (
    next.length === 0
  ) {

    return 'degraded'
  }

  /* ========================================================================
  🔥 Healthy Continuity
  ======================================================================== */

  return 'healthy'
}