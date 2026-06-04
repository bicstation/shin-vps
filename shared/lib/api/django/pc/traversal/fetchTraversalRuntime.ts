// ts
// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/traversal/fetchTraversalRuntime.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Semantic Traversal Runtime Transport
 *
 * PURPOSE:
 *
 * - semantic continuation runtime
 * - traversal continuity authority
 * - related runtime orchestration
 * - semantic edge preservation
 * - workflow continuity transport
 *
 * IMPORTANT:
 *
 * Backend remains:
 *
 * semantic authority
 *
 * Frontend remains:
 *
 * traversal observability authority
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  TraversalRuntime,

} from './contracts'

/* ============================================================================
🔥 Utils
============================================================================ */

import {

  buildEndpoint,

} from '../utils/buildEndpoint'

import {

  safeFetch,

} from '../utils/safeFetch'

/* ============================================================================
🔥 Normalize
============================================================================ */

import {

  normalizeTraversal,

} from './normalize'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const TRAVERSAL_RUNTIME_ENDPOINT =

  '/general/pc-products'

/* ============================================================================
🔥 Fetch Traversal Runtime
============================================================================ */

/**
 * Semantic traversal runtime fetch.
 *
 * IMPORTANT:
 *
 * This layer intentionally avoids:
 *
 * - semantic mutation
 * - workflow inference
 * - topology rewriting
 * - traversal hallucination
 *
 * Backend remains continuation authority.
 */
export async function fetchTraversalRuntime(

  uniqueId: string,

): Promise<TraversalRuntime | null> {

  // ================================================================
  // Empty Guard
  // ================================================================

  if (!uniqueId) {

    console.warn(

      '⚠️ TRAVERSAL RUNTIME EMPTY UNIQUE ID'
    )

    return null
  }

  // ================================================================
  // Endpoint
  // ================================================================

  const endpoint =

    buildEndpoint(

      `${TRAVERSAL_RUNTIME_ENDPOINT}/${uniqueId}/related/`

    )

  // ================================================================
  // Fetch
  // ================================================================

  const response =

    await safeFetch<TraversalRuntime>(
      endpoint
    )

  // ================================================================
  // Runtime Debug
  // ================================================================

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(

    '🌌 TRAVERSAL RUNTIME FETCH'
  )

  console.log(

    {

      uniqueId,

      endpoint,

      pipeline:
        'semantic-traversal-runtime',
    }
  )

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(

    '🌌 TRAVERSAL RUNTIME RESPONSE',

    response
  )

  // ================================================================
  // Invalid Response
  // ================================================================

  if (!response) {

    console.error(

      '🔥 TRAVERSAL RUNTIME FAILURE',

      {

        uniqueId,

        endpoint,
      }
    )

    return {

      success: false,

      traversal_runtime: {

        runtime_role:
          'continuation-runtime',

        topology_layer:
          'traversal',

        observatory:
          'semantic-traversal-runtime',
      },

      traversal_edges: [],

      traversal_graph: [],

      related_products: [],

      raw: null,
    }
  }

  // ================================================================
  // Normalize
  // ================================================================

  return normalizeTraversal(

    response

  )
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchTraversalRuntime

