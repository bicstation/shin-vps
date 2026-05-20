/**
 * SHIN CORE LINX
 * Traversal Runtime
 *
 * continuation.ts
 *
 * Responsibilities:
 * - semantic continuation stabilization
 * - exploration traversal continuity
 * - traversal-safe continuation shaping
 *
 * IMPORTANT:
 * Frontend does NOT generate semantic meaning.
 * Backend remains semantic authority.
 */

import type {
  TraversalNode,
} from '../contracts/runtime'

import {
  preserveTraversalSemantics,
} from '../preservation/preserveTraversalSemantics'

/**
 * Build continuation runtime.
 *
 * IMPORTANT:
 * This layer intentionally avoids:
 * - similarity calculation
 * - graph generation
 * - semantic inference
 * - workflow guessing
 *
 * Backend remains exploration authority.
 */
export function buildContinuationTraversal(
  nodes: TraversalNode[],
): TraversalNode[] {
  /**
   * Preserve backend semantic meaning.
   */
  const preserved =
    preserveTraversalSemantics(nodes)

  /**
   * Lightweight traversal-safe shaping.
   *
   * IMPORTANT:
   * Recursive semantic expansion is prohibited.
   */
  return preserved.map((node) => ({
    entity: {
      id: node.entity.id,

      unique_id:
        node.entity.unique_id,

      name:
        node.entity.name,

      image_url:
        node.entity.image_url,

      semantic_labels:
        node.entity.semantic_labels,
    },

    edge: node.edge
      ? {
          edge_type:
            node.edge.edge_type,

          workflow_relation:
            node.edge.workflow_relation,

          similarity_score:
            node.edge.similarity_score,

          matched_attributes:
            node.edge.matched_attributes,

          continuity_hint:
            node.edge.continuity_hint,
        }
      : undefined,
  }))
}