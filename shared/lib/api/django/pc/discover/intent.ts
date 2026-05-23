// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/intent.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Discover Intent Continuity
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * semantic intent exploration continuity
 *
 * NOT:
 *
 * semantic intent generation
 *
 * Responsibilities:
 *
 * - intent continuity stabilization
 * - workflow exploration normalization
 * - semantic exploration exposure
 * - frontend-safe intent continuity
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

  DiscoverIntent,
  DiscoverCluster,
  DiscoverProduct,

} from './contracts'

/* ============================================================================
🔥 Normalize Products
============================================================================ */

function normalizeIntentProducts(

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

function normalizeIntentClusters(

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

        normalizeIntentProducts(

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
🔥 Normalize Discover Intents
============================================================================ */

export function normalizeDiscoverIntents(

  payload?: any

): DiscoverIntent[] {

  // ======================================
  // Topology Absorption
  // ======================================

  const rawIntents =

    Array.isArray(
      payload?.intents
    )

      ? payload.intents

    : Array.isArray(
        payload?.workflow_intents
      )

        ? payload.workflow_intents

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

  return rawIntents.map(
    (
      intent
    ): DiscoverIntent => ({

      // ====================================
      // Identity
      // ====================================

      id:
        intent?.id || '',

      slug:
        intent?.slug || '',

      // ====================================
      // Basic
      // ====================================

      title:
        intent?.title || '',

      description:
        intent?.description || '',

      // ====================================
      // Semantic
      // ====================================

      workflow_tags:

        Array.isArray(
          intent?.workflow_tags
        )

          ? intent.workflow_tags

          : [],

      semantic_labels:

        Array.isArray(
          intent?.semantic_labels
        )

          ? intent.semantic_labels

          : [],

      // ====================================
      // Products
      // ====================================

      products:

        normalizeIntentProducts(

          Array.isArray(
            intent?.products
          )

            ? intent.products

          : Array.isArray(
              intent?.results
            )

              ? intent.results

          : Array.isArray(
              intent?.items
            )

              ? intent.items

          : []
        ),

      // ====================================
      // Clusters
      // ====================================

      clusters:

        normalizeIntentClusters(

          Array.isArray(
            intent?.clusters
          )

            ? intent.clusters

          : Array.isArray(
              intent?.grouped_clusters
            )

              ? intent.grouped_clusters

          : []
        ),

      // ====================================
      // Raw Backup
      // ====================================

      raw:
        intent,
    })
  )
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeDiscoverIntents