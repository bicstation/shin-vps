// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder/contracts.ts
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Runtime Contracts
 * ============================================================================
 *
 * PURPOSE:
 *   - canonical finder runtime contracts
 *   - semantic narrowing continuity contracts
 *   - traversal-safe runtime typing
 *
 * IMPORTANT:
 *   - frontend does NOT generate semantic meaning
 *   - backend remains semantic authority
 *   - adapter remains continuity authority
 *
 * RESPONSIBILITIES:
 *   - runtime-safe transport contracts
 *   - narrowing continuity typing
 *   - traversal-safe response shaping
 *   - semantic runtime continuity typing
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
🔥 Shared Runtime Contracts
============================================================================ */

import type {

  SemanticEntity,
  TraversalNode,

} from '../runtime/contracts/runtime'

/* ============================================================================
🔥 Finder Query
============================================================================ */

/**
 * Canonical finder narrowing query.
 *
 * IMPORTANT:
 * Frontend continuity query.
 *
 * Adapter layer absorbs:
 * - alias normalization
 * - traversal continuity normalization
 * - payload shaping continuity
 *
 * IMPORTANT:
 * Runtime now supports:
 *
 * multi-dimensional semantic narrowing continuity.
 */


export interface FinderQuery {

  /**
   * Semantic Narrowing
   */
  usage?: string[]

  workflow?: string[]

  shelf?: string

  /**
   * Runtime Reality
   */
  max_price?: number

  /**
   * Legacy Compatibility
   */
  budget_max?: number | null

}


/* ============================================================================
🔥 Finder Runtime Meta
============================================================================ */

/**
 * Backend semantic narrowing metadata.
 */

export interface FinderRuntimeMeta {

  total_products: number

  returned_results: number

  usage_weights?: Record<
    string,
    number
  >

  budget_max?: number | null

  fallback_mode?: boolean
}

/* ============================================================================
🔥 Finder Semantic Runtime
============================================================================ */

/**
 * Lightweight semantic runtime.
 *
 * IMPORTANT:
 * Recursive semantic graph nesting
 * is intentionally prohibited.
 */

export interface FinderSemanticRuntime {

  score?: number

  confidence?: number

  reasons?: string[]

  breakdown?: Record<
    string,
    unknown
  >
}

/* ============================================================================
🔥 Finder Product Runtime
============================================================================ */

/**
 * Finder semantic product runtime.
 */

export interface FinderProductRuntime {

  product: SemanticEntity & {

    price?: number
  }

  semantic?: FinderSemanticRuntime
}

/* ============================================================================
🔥 Finder Runtime Response
============================================================================ */

/**
 * Canonical finder narrowing runtime response.
 *
 * IMPORTANT:
 * Backend remains:
 *
 * traversal authority
 *
 * Adapter preserves:
 *
 * traversal continuity.
 */

export interface FinderRuntimeResponse {

  /**
   * Optional narrowing metadata.
   */

  meta?: FinderRuntimeMeta

  /**
   * Canonical semantic narrowing results.
   */

  results: FinderProductRuntime[]

  /**
   * Optional traversal continuity.
   */

  continuation?: TraversalNode[]

  /**
   * Optional workflow continuity.
   */

  workflow_tags?: string[]

  /**
   * Optional traversal continuity shelves.
   *
   * IMPORTANT:
   * Adapter preserves backend traversal continuity.
   */

  next_shelves?: string[]

  /**
   * Optional semantic runtime metadata.
   */

  semantic_runtime?: Record<
    string,
    unknown
  >

  /**
   * Optional adaptive runtime metadata.
   */

  adaptive_runtime?: Record<
    string,
    unknown
  >

  /**
   * Optional semantic labels continuity.
   */

  semantic_labels?: string[]

  /**
   * Optional runtime status continuity.
   */

  runtime_status?: string

  /**
   * Optional recommendation continuity.
   */

  recommendations?: FinderProductRuntime[]
}