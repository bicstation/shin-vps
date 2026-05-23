// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder/clusters.ts
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Cluster Continuity
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic narrowing cluster continuity
 *   - frontend → backend semantic normalization
 *   - traversal-safe narrowing continuity
 *
 * IMPORTANT:
 *   - frontend does NOT generate semantic meaning
 *   - backend remains semantic authority
 *   - adapter remains continuity authority
 *
 * RESPONSIBILITIES:
 *   - usage continuity normalization
 *   - workflow-safe semantic alias handling
 *   - narrowing continuity stabilization
 *   - semantic traversal-safe token shaping
 *
 * PROHIBITED:
 *   - semantic inference
 *   - semantic scoring generation
 *   - traversal fabrication
 *   - workflow invention
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Usage Cluster Aliases
============================================================================ */

/**
 * Frontend traversal continuity aliases.
 *
 * IMPORTANT:
 * These aliases exist ONLY for:
 *
 * continuity normalization
 *
 * NOT:
 *
 * semantic meaning generation
 */

export const USAGE_CLUSTER_ALIASES:
  Record<string, string> = {

  'usage-ai':
    'ai',

  'usage-gaming':
    'gaming',

  'usage-business':
    'business',

  'usage-mobile':
    'mobile',

  'usage-creator':
    'creator',
}

/* ============================================================================
🔥 Workflow Cluster Aliases
============================================================================ */

/**
 * Workflow traversal continuity aliases.
 */

export const WORKFLOW_CLUSTER_ALIASES:
  Record<string, string> = {

  'ai-workflow':
    'ai_workflow',

  'creator-workflow':
    'creator_workflow',

  'business-workflow':
    'business_workflow',

  'mobile-workflow':
    'mobile_workflow',

  'gaming-workflow':
    'gaming_workflow',
}

/* ============================================================================
🔥 Resolve Usage Cluster
============================================================================ */

/**
 * Resolve frontend usage continuity
 * into backend semantic runtime token.
 *
 * IMPORTANT:
 * Returns canonical semantic token ONLY.
 */

export function resolveUsageCluster(

  usage?: string

): string | null {

  if (!usage) {

    return null
  }

  return (

    USAGE_CLUSTER_ALIASES[
      usage
    ]

    || usage
  )
}

/* ============================================================================
🔥 Resolve Workflow Cluster
============================================================================ */

/**
 * Resolve workflow traversal continuity.
 */

export function resolveWorkflowCluster(

  workflow?: string

): string | null {

  if (!workflow) {

    return null
  }

  return (

    WORKFLOW_CLUSTER_ALIASES[
      workflow
    ]

    || workflow
  )
}

/* ============================================================================
🔥 Normalize Usage Payload
============================================================================ */

/**
 * Normalize usage payload
 * for backend semantic narrowing runtime.
 *
 * Backend currently expects:
 *
 * {
 *   usage: ['ai']
 * }
 *
 * IMPORTANT:
 * Adapter absorbs continuity mismatch.
 */

export function normalizeUsagePayload(

  usage?: string

): string[] {

  const normalized =

    resolveUsageCluster(
      usage
    )

  if (!normalized) {

    return []
  }

  return [
    normalized
  ]
}

/* ============================================================================
🔥 Normalize Workflow Payload
============================================================================ */

/**
 * Normalize workflow traversal payload.
 */

export function normalizeWorkflowPayload(

  workflow?: string

): string | null {

  return resolveWorkflowCluster(
    workflow
  )
}