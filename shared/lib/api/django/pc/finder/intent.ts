// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder/intent.ts
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Intent Continuity
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic narrowing intent continuity
 *   - frontend traversal-safe intent shaping
 *   - finder runtime intent normalization
 *
 * IMPORTANT:
 *   - frontend does NOT generate semantic meaning
 *   - backend remains semantic authority
 *   - adapter remains continuity authority
 *
 * RESPONSIBILITIES:
 *   - intent continuity normalization
 *   - narrowing-safe semantic shaping
 *   - traversal continuity stabilization
 *   - discover handoff continuity support
 *
 * PROHIBITED:
 *   - semantic inference
 *   - workflow invention
 *   - graph mutation
 *   - traversal fabrication
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  FinderQuery,

} from './contracts'

/* ============================================================================
🔥 Clusters
============================================================================ */

import {

  resolveUsageCluster,
  resolveWorkflowCluster,

} from './clusters'

/* ============================================================================
🔥 Finder Intent
============================================================================ */

/**
 * Canonical narrowing intent.
 *
 * IMPORTANT:
 * Lightweight continuity-only intent runtime.
 */

export interface FinderIntent {

  /**
   * Canonical semantic usage token.
   */

  usage?: string

  /**
   * Canonical workflow continuity token.
   */

  workflow?: string

  /**
   * Traversal continuity shelf.
   */

  shelf?: string

  /**
   * Human traversal continuity label.
   */

  label?: string
}

/* ============================================================================
🔥 Resolve Finder Intent
============================================================================ */

/**
 * Resolve finder continuity intent.
 *
 * IMPORTANT:
 * Adapter stabilizes continuity ONLY.
 *
 * Backend remains semantic authority.
 */

export function resolveFinderIntent(

  query:
    FinderQuery

): FinderIntent {

  /* ========================================================================
  🔥 Normalize Usage
  ======================================================================== */

  const usage =

    resolveUsageCluster(
      query.usage
    )

  /* ========================================================================
  🔥 Normalize Workflow
  ======================================================================== */

  const workflow =

    resolveWorkflowCluster(
      query.workflow
    )

  /* ========================================================================
  🔥 Resolve Shelf
  ======================================================================== */

  const shelf =

    query.shelf

  /* ========================================================================
  🔥 Human Continuity Label
  ======================================================================== */

  const label =

    usage
    || workflow
    || shelf
    || 'finder'

  /* ========================================================================
  🔥 Return
  ======================================================================== */

  return {

    usage,

    workflow,

    shelf,

    label:
      label
        .replaceAll(
          '_',
          ' '
        )
        .replaceAll(
          '-',
          ' '
        ),
  }
}

/* ============================================================================
🔥 Resolve Intent Path
============================================================================ */

/**
 * Resolve traversal-safe finder path continuity.
 */

export function resolveIntentPath(

  intent:
    FinderIntent

): string {

  /* ========================================================================
  🔥 Workflow Continuity
  ======================================================================== */

  if (intent.workflow) {

    return (
      `/finder/${intent.workflow}/`
    )
  }

  /* ========================================================================
  🔥 Usage Continuity
  ======================================================================== */

  if (intent.usage) {

    return (
      `/finder/${intent.usage}/`
    )
  }

  /* ========================================================================
  🔥 Shelf Continuity
  ======================================================================== */

  if (intent.shelf) {

    return (
      `/finder/${intent.shelf}/`
    )
  }

  /* ========================================================================
  🔥 Default Continuity
  ======================================================================== */

  return '/finder/'
}

/* ============================================================================
🔥 Resolve Discover Handoff Path
============================================================================ */

/**
 * Resolve discover traversal continuity handoff.
 */

export function resolveDiscoverHandoffPath(

  workflow?: string

): string | null {

  if (!workflow) {

    return null
  }

  const normalized =

    resolveWorkflowCluster(
      workflow
    )

  if (!normalized) {

    return null
  }

  return (
    `/discover/${normalized}/`
  )
}