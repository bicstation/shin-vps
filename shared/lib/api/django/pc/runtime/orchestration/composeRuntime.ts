/**
 * SHIN CORE LINX
 * Runtime Orchestration
 *
 * composeRuntime.ts
 *
 * Responsibilities:
 * - runtime composition
 * - exploration flow orchestration
 * - traversal-safe runtime connection
 *
 * IMPORTANT:
 * Frontend does NOT generate semantic meaning.
 * Backend remains semantic authority.
 */

import type {
  TraversalNode,
  SemanticEntity,
} from '../contracts/runtime'

import {
  buildContinuationTraversal,
} from '../traversal/continuation'

/**
 * Semantic exploration runtime.
 */
export interface ExplorationRuntime {
  discovery?: SemanticEntity[]

  workflow?: string

  product?: SemanticEntity

  continuation?: TraversalNode[]
}

/**
 * Compose semantic runtime.
 *
 * IMPORTANT:
 * This layer intentionally avoids:
 * - semantic inference
 * - graph mutation
 * - traversal generation
 * - workflow rewriting
 *
 * Backend remains exploration authority.
 */
export function composeRuntime(
  runtime: ExplorationRuntime,
): ExplorationRuntime {
  return {
    discovery:
      runtime.discovery ?? [],

    workflow:
      runtime.workflow,

    product:
      runtime.product,

    continuation:
      runtime.continuation
        ? buildContinuationTraversal(
            runtime.continuation,
          )
        : [],
  }
}