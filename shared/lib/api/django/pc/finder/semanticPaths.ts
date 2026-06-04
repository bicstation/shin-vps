// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder/semanticPaths.ts
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Semantic Paths
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic traversal path continuity
 *   - narrowing → traversal path stabilization
 *   - topology-safe semantic route shaping
 *
 * IMPORTANT:
 *   - frontend does NOT generate semantic meaning
 *   - backend remains semantic traversal authority
 *   - adapter remains continuity authority
 *
 * RESPONSIBILITIES:
 *   - semantic route continuity
 *   - workflow traversal path shaping
 *   - discover continuity stabilization
 *   - traversal-safe path normalization
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
🔥 Clusters
============================================================================ */

import {

  resolveUsageCluster,
  resolveWorkflowCluster,

} from './clusters'

/* ============================================================================
🔥 Semantic Path Runtime
============================================================================ */

/**
 * Canonical semantic traversal path.
 */

export interface SemanticPathRuntime {

  /**
   * Canonical traversal path.
   */

  path: string

  /**
   * Optional workflow continuity.
   */

  workflow?: string

  /**
   * Optional usage continuity.
   */

  usage?: string

  /**
   * Human traversal continuity label.
   */

  label?: string
}

/* ============================================================================
🔥 Resolve Finder Path
============================================================================ */

/**
 * Resolve finder narrowing continuity path.
 */

export function resolveFinderPath(

  usage?: string

): SemanticPathRuntime {

  /* ========================================================================
  🔥 Normalize Usage
  ======================================================================== */

  const normalized =

    resolveUsageCluster(
      usage
    )

  /* ========================================================================
  🔥 Path
  ======================================================================== */

  const path =

    normalized

      ? `/finder/${normalized}/`

      : '/finder/'

  /* ========================================================================
  🔥 Return
  ======================================================================== */

  return {

    path,

    usage:
      normalized
      || undefined,

    label:

      normalized
        ?.replaceAll(
          '_',
          ' '
        )
        .replaceAll(
          '-',
          ' '
        )

      || 'finder',
  }
}

/* ============================================================================
🔥 Resolve Discover Path
============================================================================ */

/**
 * Resolve discover traversal continuity path.
 */

export function resolveDiscoverPath(

  workflow?: string

): SemanticPathRuntime {

  /* ========================================================================
  🔥 Normalize Workflow
  ======================================================================== */

  const normalized =

    resolveWorkflowCluster(
      workflow
    )

  /* ========================================================================
  🔥 Path
  ======================================================================== */

  const path =

    normalized

      ? `/discover/${normalized}/`

      : '/discover/'

  /* ========================================================================
  🔥 Return
  ======================================================================== */

  return {

    path,

    workflow:
      normalized
      || undefined,

    label:

      normalized
        ?.replaceAll(
          '_',
          ' '
        )
        .replaceAll(
          '-',
          ' '
        )

      || 'discover',
  }
}

/* ============================================================================
🔥 Resolve Traversal Path
============================================================================ */

/**
 * Resolve semantic traversal continuity path.
 *
 * IMPORTANT:
 * Finder continuity is prioritized first.
 */

export function resolveTraversalPath(

  options: {

    usage?: string

    workflow?: string
  }

): SemanticPathRuntime {

  /* ========================================================================
  🔥 Workflow Traversal
  ======================================================================== */

  if (
    options.workflow
  ) {

    return resolveDiscoverPath(
      options.workflow
    )
  }

  /* ========================================================================
  🔥 Narrowing Traversal
  ======================================================================== */

  return resolveFinderPath(
    options.usage
  )
}

/* ============================================================================
🔥 Join Traversal Paths
============================================================================ */

/**
 * Resolve semantic traversal lineage path.
 *
 * Example:
 *
 * /discover/ai_workflow/creator_workflow/
 */

export function joinTraversalPaths(

  ...segments: string[]

): string {

  /* ========================================================================
  🔥 Normalize Segments
  ======================================================================== */

  const normalized =

    segments
      .filter(Boolean)
      .map((segment) => (

        segment
          .replaceAll(
            '//',
            '/'
          )
          .replace(
            /^\/+/,
            ''
          )
          .replace(
            /\/+$/,
            ''
          )
      ))

  /* ========================================================================
  🔥 Empty
  ======================================================================== */

  if (
    normalized.length === 0
  ) {

    return '/'
  }

  /* ========================================================================
  🔥 Join
  ======================================================================== */

  return (
    '/'
    + normalized.join('/')
    + '/'
  )
}