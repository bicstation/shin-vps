// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/contracts/traversal.ts
// ============================================================================

/**
 * SHIN CORE LINX
 * Traversal Observatory Contracts
 *
 * IMPORTANT:
 * This file defines:
 *
 * traversal observability contracts
 *
 * NOT:
 *
 * traversal authority
 *
 * Backend remains:
 *
 * - traversal authority
 * - continuation authority
 * - graph authority
 * - workflow authority
 *
 * Frontend traversal contracts exist ONLY for:
 *
 * - traversal observability
 * - continuation visualization
 * - runtime-safe rendering
 * - exploration inspection
 */

/* ============================================================================
🔥 Traversal Edge Type
============================================================================ */

export type TraversalEdgeType =

  | 'semantic_related'
  | 'workflow_evolution'
  | 'workflow_continuation'
  | 'ai_continuity'
  | 'semantic_similarity'
  | 'adaptive_transition'
  | 'continuation'
  | 'graph-edge'

/* ============================================================================
🔥 Workflow Relation
============================================================================ */

export type WorkflowRelation =

  | 'same_workflow'
  | 'workflow_evolution'
  | 'workflow_transition'
  | 'workflow_expansion'
  | 'workflow_continuation'
  | 'semantic_continuation'

/* ============================================================================
🔥 Traversal Edge
============================================================================ */

export type TraversalEdge = {

  edge_type?: TraversalEdgeType

  workflow_relation?: WorkflowRelation

  source_node?: string | null

  target_node?: string | null

  similarity_score?: number | null

  semantic_score?: number | null

  continuity_hint?: string | null

  matched_attributes?: string[]

  traversal_depth?: number | null

  shallow_payload?: boolean

}

/* ============================================================================
🔥 Semantic Related Node
============================================================================ */

export type SemanticRelatedNode = {

  id?: string | number

  unique_id?: string

  title?: string

  semantic_runtime?: Record<
    string,
    any
  >

  workflow_tags?: string[]

  semantic_labels?: any[]

  edge?: TraversalEdge

}

/* ============================================================================
🔥 Traversal Runtime
============================================================================ */

export type TraversalRuntime = {

  semantic_related?:

    SemanticRelatedNode[]

  traversal_enabled?: boolean

  traversal_depth?: number | null

  recursive_protection?: boolean

  shallow_payload?: boolean

  continuation_runtime?: boolean

}

/* ============================================================================
🔥 Continuation Runtime
============================================================================ */

export type ContinuationRuntime = {

  continuation_enabled?: boolean

  continuation_role?: string | null

  continuation_type?: string | null

  continuation_depth?: number | null

  continuation_strategy?: string | null

}

/* ============================================================================
🔥 Graph Traversal Runtime
============================================================================ */

export type GraphTraversalRuntime = {

  graph_runtime?: boolean

  graph_depth?: number | null

  graph_nodes?: number | null

  graph_edges?: number | null

  graph_safe?: boolean

}

/* ============================================================================
🔥 Traversal Observatory
============================================================================ */

export type TraversalObservatory =

  TraversalRuntime
  &

  ContinuationRuntime
  &

  GraphTraversalRuntime

/* ============================================================================
🔥 Traversal Inspector Props
============================================================================ */

export type TraversalInspectorProps = {

  runtime: {

    payload?: {

      semantic_related?:

        SemanticRelatedNode[]

    }

  } | null

}

/* ============================================================================
🔥 Traversal Edge Inspector Props
============================================================================ */

export type TraversalEdgeInspectorProps = {

  edges?:

    TraversalEdge[]

}

/* ============================================================================
🔥 Traversal Runtime Rules
============================================================================ */

/**
 * IMPORTANT:
 *
 * Frontend traversal contracts:
 *
 * ❌ must NOT generate traversal meaning
 * ❌ must NOT mutate continuation logic
 * ❌ must NOT rewrite graph relationships
 * ❌ must NOT infer workflow transitions
 *
 * Allowed:
 *
 * ✅ traversal observability
 * ✅ continuation visualization
 * ✅ graph-safe rendering
 * ✅ exploration rendering
 */

/* ============================================================================
🔥 Default Export
============================================================================ */

export default TraversalObservatory