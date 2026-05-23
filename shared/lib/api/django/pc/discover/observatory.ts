// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/observatory.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Discover Observatory Runtime
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * discover runtime visibility
 *
 * NOT:
 *
 * semantic authority
 *
 * Responsibilities:
 *
 * - discover runtime observability
 * - topology visibility
 * - continuity inspection
 * - normalization tracing
 * - exploration runtime diagnostics
 *
 * IMPORTANT:
 *
 * Observatory is:
 *
 * visibility authority
 *
 * NOT:
 *
 * continuity authority
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  DiscoverRuntime,

} from './contracts'

/* ============================================================================
🔥 Observatory Report
============================================================================ */

export type DiscoverObservatoryReport = {

  success: boolean

  topology: {

    products: number

    clusters: number

    intents: number

    paths: number

    recommendations: number
  }

  runtime: {

    semantic_runtime: boolean

    adaptive_runtime: boolean

    semantic_graph: boolean

    grouped_attributes: boolean
  }

  continuity: {

    normalized: boolean

    continuity_status: string

    runtime_path: string
  }

  warnings: string[]

  raw?: any
}

/* ============================================================================
🔥 Inspect Discover Runtime
============================================================================ */

export function inspectDiscoverRuntime(

  runtime?: DiscoverRuntime | null

): DiscoverObservatoryReport {

  // ======================================
  // Empty Runtime
  // ======================================

  if (!runtime) {

    console.error(
      '🔥 DISCOVER OBSERVATORY EMPTY RUNTIME'
    )

    return {

      success: false,

      topology: {

        products: 0,
        clusters: 0,
        intents: 0,
        paths: 0,
        recommendations: 0,
      },

      runtime: {

        semantic_runtime: false,
        adaptive_runtime: false,
        semantic_graph: false,
        grouped_attributes: false,
      },

      continuity: {

        normalized: false,

        continuity_status:
          'missing-runtime',

        runtime_path:
          'discover/observatory/failure',
      },

      warnings: [
        'discover runtime missing',
      ],

      raw: null,
    }
  }

  // ======================================
  // Topology Metrics
  // ======================================

  const topology = {

    products:

      Array.isArray(
        runtime?.products
      )

        ? runtime.products.length

        : 0,

    clusters:

      Array.isArray(
        runtime?.clusters
      )

        ? runtime.clusters.length

        : 0,

    intents:

      Array.isArray(
        runtime?.intents
      )

        ? runtime.intents.length

        : 0,

    paths:

      Array.isArray(
        runtime?.paths
      )

        ? runtime.paths.length

        : 0,

    recommendations:

      Array.isArray(
        runtime?.recommendations
      )

        ? runtime.recommendations.length

        : 0,
  }

  // ======================================
  // Runtime Metrics
  // ======================================

  const runtimeMetrics = {

    semantic_runtime:
      !!runtime?.semantic_runtime,

    adaptive_runtime:
      !!runtime?.adaptive_runtime,

    semantic_graph:

      Array.isArray(
        runtime?.semantic_graph
      ),

    grouped_attributes:
      !!runtime?.grouped_attributes,
  }

  // ======================================
  // Continuity Metrics
  // ======================================

  const continuity = {

    normalized:

      runtime?.observatory
        ?.normalized || false,

    continuity_status:

      runtime?.observatory
        ?.continuity_status

        || 'unknown',

    runtime_path:

      runtime?.observatory
        ?.runtime_path

        || 'discover/observatory',
  }

  // ======================================
  // Warnings
  // ======================================

  const warnings: string[] = []

  // ======================================
  // Products
  // ======================================

  if (!topology.products) {

    warnings.push(
      'products continuity empty'
    )
  }

  // ======================================
  // Clusters
  // ======================================

  if (!topology.clusters) {

    warnings.push(
      'clusters continuity empty'
    )
  }

  // ======================================
  // Paths
  // ======================================

  if (!topology.paths) {

    warnings.push(
      'paths continuity empty'
    )
  }

  // ======================================
  // Semantic Runtime
  // ======================================

  if (!runtimeMetrics.semantic_runtime) {

    warnings.push(
      'semantic runtime missing'
    )
  }

  // ======================================
  // Observatory Visibility
  // ======================================

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 DISCOVER OBSERVATORY'
  )

  console.log({
    topology,
    runtime: runtimeMetrics,
    continuity,
    warnings,
  })

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  // ======================================
  // Return
  // ======================================

  return {

    success:
      warnings.length === 0,

    topology,

    runtime:
      runtimeMetrics,

    continuity,

    warnings,

    raw:
      runtime,
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default inspectDiscoverRuntime