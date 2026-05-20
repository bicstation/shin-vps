/**
 * SHIN CORE LINX
 * Semantic Preservation Layer
 *
 * preserveTraversalSemantics
 *
 * Responsibilities:
 * - preserve traversal meaning
 * - preserve workflow continuity
 * - preserve edge semantics
 * - avoid semantic drift
 *
 * IMPORTANT:
 * Frontend does NOT generate semantic meaning.
 * Backend remains semantic authority.
 */

import type {
  TraversalNode,
} from '../contracts/runtime'

/**
 * Preserve traversal semantics.
 *
 * IMPORTANT:
 * This layer intentionally avoids:
 * - semantic inference
 * - workflow mutation
 * - edge rewriting
 * - continuation guessing
 *
 * We only stabilize payload shape
 * while preserving backend semantic meaning.
 */
export function preserveTraversalSemantics(
  nodes: TraversalNode[],
): TraversalNode[] {
  if (!Array.isArray(nodes)) {
    return []
  }

  return nodes.map((node) => ({
    entity: {
      id: node.entity?.id ?? 0,

      unique_id:
        node.entity?.unique_id ?? '',

      name:
        node.entity?.name ?? 'Unknown',

      image_url:
        node.entity?.image_url ?? '',

      semantic_labels:
        Array.isArray(node.entity?.semantic_labels)
          ? node.entity.semantic_labels
          : [],
    },

    edge: node.edge
      ? {
          edge_type:
            node.edge.edge_type ?? 'semantic_related',

          workflow_relation:
            node.edge.workflow_relation,

          similarity_score:
            node.edge.similarity_score,

          matched_attributes:
            Array.isArray(node.edge.matched_attributes)
              ? node.edge.matched_attributes
              : [],

          continuity_hint:
            node.edge.continuity_hint,
        }
      : undefined,
  }))
}