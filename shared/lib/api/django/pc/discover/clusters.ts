// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/clusters.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Discover Cluster Continuity
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * semantic exploration cluster continuity
 *
 * NOT:
 *
 * semantic authority generation
 *
 * Responsibilities:
 *
 * - cluster continuity stabilization
 * - grouped exploration normalization
 * - semantic exploration grouping
 * - frontend-safe cluster exposure
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

  DiscoverCluster,
  DiscoverProduct,

} from './contracts'

/* ============================================================================
🔥 Normalize Cluster Products
============================================================================ */

function normalizeClusterProducts(

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
🔥 Normalize Discover Clusters
============================================================================ */

export function normalizeDiscoverClusters(

  payload?: any

): DiscoverCluster[] {

  // ======================================
  // Topology Absorption
  // ======================================

  const rawClusters =

    Array.isArray(
      payload?.clusters
    )

      ? payload.clusters

    : Array.isArray(
        payload?.grouped_clusters
      )

        ? payload.grouped_clusters

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

  return rawClusters.map(
    (
      cluster
    ): DiscoverCluster => ({

      // ====================================
      // Identity
      // ====================================

      id:
        cluster?.id || '',

      slug:
        cluster?.slug || '',

      // ====================================
      // Basic
      // ====================================

      title:
        cluster?.title || '',

      description:
        cluster?.description || '',

      // ====================================
      // Visual
      // ====================================

      icon:
        cluster?.icon || '',

      color:
        cluster?.color || '',

      // ====================================
      // Semantic
      // ====================================

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

      // ====================================
      // Products
      // ====================================

      products:

        normalizeClusterProducts(

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

      // ====================================
      // Raw Backup
      // ====================================

      raw:
        cluster,
    })
  )
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeDiscoverClusters