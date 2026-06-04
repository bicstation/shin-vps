// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/semanticPaths.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Discover Semantic Path Continuity
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * semantic exploration path continuity
 *
 * NOT:
 *
 * semantic path generation
 *
 * Responsibilities:
 *
 * - semantic path normalization
 * - exploration route continuity
 * - workflow traversal continuity
 * - frontend-safe semantic path exposure
 *
 * IMPORTANT:
 *
 * Backend remains:
 *
 * semantic authority
 *
 * Discover remains:
 *
 * exploration continuity authority
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  DiscoverPath,
  DiscoverCluster,
  DiscoverProduct,

} from './contracts'

/* ============================================================================
🔥 Normalize Products
============================================================================ */

function normalizePathProducts(

  products?: any[]

): DiscoverProduct[] {

  // ======================================
  // Safe Array
  // ======================================

  const safeProducts =

    Array.isArray(products)

      ? products

      : []

  // ======================================
  // Normalize
  // ======================================

  return safeProducts.map(
    (
      item
    ): DiscoverProduct => ({

      // ====================================
      // Identity
      // ====================================

      id:
        item?.id,

      unique_id:
        item?.unique_id || '',

      // ====================================
      // Basic
      // ====================================

      name:
        item?.name || '',

      maker:
        item?.maker || '',

      description:
        item?.description || '',

      // ====================================
      // Media
      // ====================================

      image_url:
        item?.image_url || '',

      // ====================================
      // Pricing
      // ====================================

      price:
        item?.price || 0,

      // ====================================
      // Semantic
      // ====================================

      semantic_role:
        item?.semantic_role || 'primary',

      semantic_weight:
        item?.semantic_weight || 0,

      semantic_score:
        item?.semantic_score || 0,

      semantic_labels:

        Array.isArray(
          item?.semantic_labels
        )

          ? item.semantic_labels

          : [],

      workflow_tags:

        Array.isArray(
          item?.workflow_tags
        )

          ? item.workflow_tags

          : [],

      grouped_attributes:
        item?.grouped_attributes || {},

      semantic_runtime:
        item?.semantic_runtime || {},

      adaptive_runtime:
        item?.adaptive_runtime || {},

      render_hints:
        item?.render_hints || {},

      // ====================================
      // Discover
      // ====================================

      discover_reason:
        item?.discover_reason || '',

      discover_path:
        item?.discover_path || '',

      discover_cluster:
        item?.discover_cluster || '',

      discover_confidence:
        item?.discover_confidence || 0,

      // ====================================
      // Raw Backup
      // ====================================

      raw:
        item,
    })
  )
}

/* ============================================================================
🔥 Normalize Clusters
============================================================================ */

function normalizePathClusters(

  clusters?: any[]

): DiscoverCluster[] {

  // ======================================
  // Safe Array
  // ======================================

  const safeClusters =

    Array.isArray(clusters)

      ? clusters

      : []

  // ======================================
  // Normalize
  // ======================================

  return safeClusters.map(
    (
      cluster
    ): DiscoverCluster => ({

      id:
        cluster?.id || '',

      slug:
        cluster?.slug || '',

      title:
        cluster?.title || '',

      description:
        cluster?.description || '',

      icon:
        cluster?.icon || '',

      color:
        cluster?.color || '',

      semantic_weight:
        cluster?.semantic_weight || 0,

      workflow_tags:

        Array.isArray(
          cluster?.workflow_tags
        )

          ? cluster.workflow_tags

          : [],

      grouped_attributes:
        cluster?.grouped_attributes || {},

      products:

        normalizePathProducts(

          Array.isArray(
            cluster?.products
          )

            ? cluster.products

          : Array.isArray(
              cluster?.results
            )

              ? cluster.results

          : Array.isArray(
              cluster?.items
            )

              ? cluster.items

          : []
        ),

      raw:
        cluster,
    })
  )
}

/* ============================================================================
🔥 Normalize Semantic Paths
============================================================================ */

export function normalizeSemanticPaths(

  payload?: any

): DiscoverPath[] {

  // ======================================
  // Topology Absorption
  // ======================================

  const rawPaths =

    Array.isArray(
      payload?.paths
    )

      ? payload.paths

    : Array.isArray(
        payload?.semantic_paths
      )

        ? payload.semantic_paths

    : Array.isArray(
        payload?.traversal_paths
      )

        ? payload.traversal_paths

    : Array.isArray(
        payload?.results
      )

        ? payload.results

    : Array.isArray(
        payload?.items
      )

        ? payload.items

    : Array.isArray(
        payload
      )

        ? payload

        : []

  // ======================================
  // Normalize
  // ======================================

  return rawPaths.map(
    (
      path
    ): DiscoverPath => ({

      // ====================================
      // Identity
      // ====================================

      id:
        path?.id || '',

      slug:
        path?.slug || '',

      // ====================================
      // Basic
      // ====================================

      title:
        path?.title || '',

      description:
        path?.description || '',

      intent:
        path?.intent || '',

      // ====================================
      // Semantic Route
      // ====================================

      semantic_route:

        Array.isArray(
          path?.semantic_route
        )

          ? path.semantic_route

          : [],

      workflow_tags:

        Array.isArray(
          path?.workflow_tags
        )

          ? path.workflow_tags

          : [],

      // ====================================
      // Products
      // ====================================

      products:

        normalizePathProducts(

          Array.isArray(
            path?.products
          )

            ? path.products

          : Array.isArray(
              path?.results
            )

              ? path.results

          : Array.isArray(
              path?.items
            )

              ? path.items

          : []
        ),

      // ====================================
      // Clusters
      // ====================================

      clusters:

        normalizePathClusters(

          Array.isArray(
            path?.clusters
          )

            ? path.clusters

          : Array.isArray(
              path?.grouped_clusters
            )

              ? path.grouped_clusters

          : []
        ),

      // ====================================
      // Raw Backup
      // ====================================

      raw:
        path,
    })
  )
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeSemanticPaths