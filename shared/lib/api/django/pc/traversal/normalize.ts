// ts id="vkbxjt"
// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/traversal/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  TraversalRuntime,

  TraversalProduct,

  TraversalEdge,

} from './contracts'

/* ============================================================================
🔥 Normalize Traversal
============================================================================ */

/**
 * Normalize semantic traversal runtime.
 *
 * IMPORTANT:
 *
 * This layer:
 *
 * - preserves semantic authority
 * - preserves traversal continuity
 * - preserves workflow relations
 * - preserves edge topology
 *
 * This layer intentionally avoids:
 *
 * - semantic mutation
 * - workflow inference
 * - frontend rendering logic
 * - cinematic interpretation
 */
export function normalizeTraversal(

  payload: unknown,

): TraversalRuntime {

  // ================================================================
  // Raw Array
  // ================================================================

  const rawProducts =

    Array.isArray(payload)
      ? payload
      : []

  // ================================================================
  // Related Products
  // ================================================================

  const relatedProducts:

    TraversalProduct[] =

      rawProducts.map(

        (
          item: any
        ) => {

          // ======================================================
          // Edge
          // ======================================================

          const edge:

            TraversalEdge = {

              edge_type:
                item?.edge?.edge_type
                || '-',

              similarity_score:
                item?.edge?.similarity_score
                || 0,

              workflow_relation:
                item?.edge?.workflow_relation
                || '-',

              reason:
                item?.edge?.reason
                || null,
            }

          // ======================================================
          // Product
          // ======================================================

          return {

            id:
              item?.id,

            unique_id:
              item?.unique_id,

            name:
              item?.name,

            image_url:
              item?.image_url,

            maker:
              item?.maker,

            product_type:
              item?.product_type,

            price:
              item?.price,

            semantic_score:
              item?.semantic_score
              || 0,

            semantic_labels:

              Array.isArray(
                item?.semantic_labels
              )

                ? item.semantic_labels

                : [],

            edge,
          }
        }
      )

  // ================================================================
  // Traversal Edges
  // ================================================================

  const traversalEdges:

    TraversalEdge[] =

      relatedProducts.map(

        (
          product
        ) => (

          product.edge || {}
        )
      )

  // ================================================================
  // Traversal Graph
  // ================================================================

  const traversalGraph =

    relatedProducts.map(

      (
        product
      ) => ({

        id:
          product.unique_id,

        type:
          product.product_type,

        semantic_score:
          product.semantic_score,

        edge_type:
          product.edge?.edge_type,

        workflow_relation:
          product.edge?.workflow_relation,
      })
    )

  // ================================================================
  // Continuity
  // ================================================================

  const hasWorkflowContinuity =

    traversalEdges.some(

      (
        edge
      ) =>

        edge.workflow_relation
        && edge.workflow_relation !== '-'
    )

  const hasSemanticContinuity =

    traversalEdges.some(

      (
        edge
      ) =>

        edge.edge_type
        && edge.edge_type !== '-'
    )

  // ================================================================
  // Runtime
  // ================================================================

  const traversalRuntime = {

    runtime_role:
      'continuation-runtime',

    topology_layer:
      'traversal',

    observatory:
      'semantic-traversal-runtime',

    runtime_status:
      'active',
  }

  // ================================================================
  // Continuation Runtime
  // ================================================================

  const continuationRuntime = {

    workflow_continuity:
      hasWorkflowContinuity,

    semantic_continuity:
      hasSemanticContinuity,

    graph_continuity:
      traversalGraph.length > 0,
  }

  // ================================================================
  // Runtime Debug
  // ================================================================

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(

    '🌌 NORMALIZED TRAVERSAL RUNTIME'
  )

  console.log(

    {

      runtime_role:
        traversalRuntime.runtime_role,

      topology_layer:
        traversalRuntime.topology_layer,

      traversal_edges:
        traversalEdges.length,

      traversal_graph:
        traversalGraph.length,

      related_products:
        relatedProducts.length,

      workflow_continuity:
        continuationRuntime.workflow_continuity,

      semantic_continuity:
        continuationRuntime.semantic_continuity,
    }
  )

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  // ================================================================
  // Return
  // ================================================================

  return {

    success: true,

    traversal_runtime:
      traversalRuntime,

    continuation_runtime:
      continuationRuntime,

    traversal_edges:
      traversalEdges,

    traversal_graph:
      traversalGraph,

    related_products:
      relatedProducts,

    raw:
      payload,
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeTraversal

