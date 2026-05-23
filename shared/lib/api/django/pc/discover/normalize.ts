// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Discover Runtime Normalization
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * semantic exploration topology absorption
 *
 * NOT:
 *
 * semantic meaning generation
 *
 * Responsibilities:
 *
 * - discover topology normalization
 * - runtime continuity stabilization
 * - exploration contract continuity
 * - frontend-safe discover exposure
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

  DiscoverRuntime,

} from './contracts'

/* ============================================================================
🔥 Normalize Layers
============================================================================ */

import {

  normalizeDiscoverClusters,

} from './clusters'

import {

  normalizeDiscoverIntents,

} from './intent'

/* ============================================================================
🔥 Normalize Products
============================================================================ */

function normalizeProducts(

  payload?: any

): any[] {

  // ======================================
  // Topology Absorption
  // ======================================

  const rawProducts =

    Array.isArray(
      payload?.products
    )

      ? payload.products

    : Array.isArray(
        payload?.results
      )

        ? payload.results

    : Array.isArray(
        payload?.items
      )

        ? payload.items

    : Array.isArray(
        payload?.ranking_products
      )

        ? payload.ranking_products

    : Array.isArray(
        payload
      )

        ? payload

        : []

  // ======================================
  // Normalize
  // ======================================

  return rawProducts.map(
    (
      item
    ) => ({

      id:
        item?.id,

      unique_id:
        item?.unique_id || '',

      name:
        item?.name || '',

      maker:
        item?.maker || '',

      description:
        item?.description || '',

      image_url:
        item?.image_url || '',

      price:
        item?.price || 0,

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

      raw:
        item,
    })
  )
}

/* ============================================================================
🔥 Normalize Paths
============================================================================ */

function normalizePaths(

  payload?: any

): any[] {

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

    : []

  // ======================================
  // Normalize
  // ======================================

  return rawPaths.map(
    (
      path
    ) => ({

      id:
        path?.id || '',

      slug:
        path?.slug || '',

      title:
        path?.title || '',

      description:
        path?.description || '',

      intent:
        path?.intent || '',

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

      products:

        normalizeProducts(

          Array.isArray(
            path?.products
          )

            ? path.products

          : Array.isArray(
              path?.results
            )

              ? path.results

          : []
        ),

      raw:
        path,
    })
  )
}

/* ============================================================================
🔥 Normalize Recommendations
============================================================================ */

function normalizeRecommendations(

  payload?: any

): any[] {

  // ======================================
  // Topology Absorption
  // ======================================

  const rawRecommendations =

    Array.isArray(
      payload?.recommendations
    )

      ? payload.recommendations

    : Array.isArray(
        payload?.discover_recommendations
      )

        ? payload.discover_recommendations

    : Array.isArray(
        payload?.results
      )

        ? payload.results

    : []

  // ======================================
  // Normalize
  // ======================================

  return rawRecommendations.map(
    (
      recommendation
    ) => ({

      id:
        recommendation?.id || '',

      type:
        recommendation?.type || '',

      title:
        recommendation?.title || '',

      description:
        recommendation?.description || '',

      reason:
        recommendation?.reason || '',

      semantic_weight:
        recommendation?.semantic_weight || 0,

      workflow_tags:

        Array.isArray(
          recommendation?.workflow_tags
        )

          ? recommendation.workflow_tags

          : [],

      products:

        normalizeProducts(

          Array.isArray(
            recommendation?.products
          )

            ? recommendation.products

          : Array.isArray(
              recommendation?.results
            )

              ? recommendation.results

          : []
        ),

      raw:
        recommendation,
    })
  )
}

/* ============================================================================
🔥 Normalize Discover Runtime
============================================================================ */

export function normalizeDiscoverRuntime(

  payload?: any

): DiscoverRuntime {

  // ======================================
  // Canonical Continuity
  // ======================================

  const products =
    normalizeProducts(payload)

  const clusters =
    normalizeDiscoverClusters(payload)

  const intents =
    normalizeDiscoverIntents(payload)

  const paths =
    normalizePaths(payload)

  const recommendations =
    normalizeRecommendations(payload)

  // ======================================
  // Runtime Debug
  // ======================================

  console.log(
    '🔥 DISCOVER NORMALIZE',
    {

      products:
        products.length,

      clusters:
        clusters.length,

      intents:
        intents.length,

      paths:
        paths.length,

      recommendations:
        recommendations.length,
    }
  )

  // ======================================
  // Return
  // ======================================

  return {

    success:
      payload?.success || false,

    semantic_schema_version:
      payload?.semantic_schema_version || 1,

    semantic_runtime:
      payload?.semantic_runtime || {},

    adaptive_runtime:
      payload?.adaptive_runtime || {},

    render_hints:
      payload?.render_hints || {},

    // ====================================
    // Canonical Continuity
    // ====================================

    products,
    clusters,
    intents,
    paths,
    recommendations,

    // ====================================
    // Exploration Continuity
    // ====================================

    grouped_attributes:
      payload?.grouped_attributes || {},

    semantic_graph:

      Array.isArray(
        payload?.semantic_graph
      )

        ? payload.semantic_graph

        : [],

    workflow_tags:

      Array.isArray(
        payload?.workflow_tags
      )

        ? payload.workflow_tags

        : [],

    semantic_labels:

      Array.isArray(
        payload?.semantic_labels
      )

        ? payload.semantic_labels

        : [],

    // ====================================
    // Observatory
    // ====================================

    observatory: {

      topology_source:
        payload?.topology_source
        || 'discover-runtime',

      continuity_status:
        'normalized',

      normalized:
        true,

      runtime_path:
        'discover/normalize',

      warnings: [],
    },

    // ====================================
    // SEO
    // ====================================

    seo:
      payload?.seo || {},

    faq:

      Array.isArray(
        payload?.faq
      )

        ? payload.faq

        : [],

    breadcrumbs:

      Array.isArray(
        payload?.breadcrumbs
      )

        ? payload.breadcrumbs

        : [],

    schemas:
      payload?.schemas || {},

    // ====================================
    // Raw Backup
    // ====================================

    raw:
      payload,
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeDiscoverRuntime