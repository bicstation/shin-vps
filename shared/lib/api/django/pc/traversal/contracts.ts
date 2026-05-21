// ts id="mdtwzc"
// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/traversal/contracts.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/* ============================================================================
🔥 Traversal Edge
============================================================================ */

/**
 * Semantic continuation edge authority.
 *
 * IMPORTANT:
 *
 * Backend owns:
 *
 * - edge meaning
 * - workflow continuity
 * - semantic relation
 *
 * Frontend owns:
 *
 * - observability
 * - cinematic rendering
 * - exploration visualization
 */
export interface TraversalEdge {

  edge_type?: string

  similarity_score?: number

  workflow_relation?: string

  reason?: string | null
}

/* ============================================================================
🔥 Traversal Product
============================================================================ */

export interface TraversalProduct {

  id?: number

  unique_id?: string

  name?: string

  image_url?: string

  maker?: string

  product_type?: string

  price?: number

  semantic_score?: number

  semantic_labels?: string[]

  edge?: TraversalEdge
}

/* ============================================================================
🔥 Traversal Runtime
============================================================================ */

/**
 * Traversal runtime authority contract.
 *
 * IMPORTANT:
 *
 * This contract represents:
 *
 * semantic continuation runtime
 *
 * NOT:
 *
 * frontend rendering authority
 */
export interface TraversalRuntime {

  success?: boolean

  // ================================================================
  // Runtime
  // ================================================================

  traversal_runtime?: {

    runtime_role?: string

    topology_layer?: string

    observatory?: string

    runtime_status?: string
  }

  continuation_runtime?: {

    workflow_continuity?: boolean

    semantic_continuity?: boolean

    graph_continuity?: boolean
  }

  // ================================================================
  // Traversal Topology
  // ================================================================

  traversal_edges?: TraversalEdge[]

  traversal_graph?: unknown[]

  related_products?: TraversalProduct[]

  // ================================================================
  // Raw Preservation
  // ================================================================

  raw?: unknown
}

