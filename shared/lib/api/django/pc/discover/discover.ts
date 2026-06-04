// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/discover.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Discover Continuity Gateway
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * semantic exploration continuity exposure
 *
 * NOT:
 *
 * semantic recommendation generation
 *
 * Responsibilities:
 *
 * - discover transport continuity
 * - exploration runtime stabilization
 * - frontend-safe discover exposure
 * - topology continuity absorption
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

  normalizeDiscoverRuntime,

} from './runtime'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const DISCOVER_ENDPOINT =
  '/general/pc-products/discover'

/* ============================================================================
🔥 Fetch Discover Runtime
============================================================================ */

/**
 * Frontend-safe discover gateway.
 *
 * IMPORTANT:
 *
 * This layer intentionally avoids:
 *
 * - semantic inference
 * - AI recommendation generation
 * - workflow mutation
 * - exploration rewriting
 *
 * Backend remains semantic authority.
 */
export async function fetchDiscover(

  slug = 'default',

): Promise<DiscoverRuntime | null> {

  // ======================================
  // Empty Guard
  // ======================================

  if (!slug) {

    console.warn(
      '⚠️ DISCOVER EMPTY SLUG'
    )

    return null
  }

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    buildEndpoint(
      `${DISCOVER_ENDPOINT}/${slug}/`
    )

  // ======================================
  // Fetch
  // ======================================

  const response =

    await safeFetch<DiscoverRuntime>(
      endpoint
    )

  // ======================================
  // Runtime Debug
  // ======================================

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 DISCOVER FETCH'
  )

  console.log({

    slug,
    endpoint,

    pipeline:
      'discover-continuity-gateway',
  })

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 DISCOVER RESPONSE',
    response
  )

  // ======================================
  // Invalid Response
  // ======================================

  if (!response) {

    console.error(
      '🔥 DISCOVER FETCH FAILURE',
      {
        slug,
        endpoint,
      }
    )

    return {

      success: false,

      products: [],

      clusters: [],

      paths: [],

      recommendations: [],

      intents: [],

      observatory: {

        continuity_status:
          'failure',

        normalized:
          false,

        runtime_path:
          'discover/failure',
      },

      raw: null,
    }
  }

  // ======================================
  // Normalize
  // ======================================

  const normalized =

    normalizeDiscoverRuntime(
      response
    )

  // ======================================
  // Runtime Visibility
  // ======================================

  console.log(
    '🔥 NORMALIZED DISCOVER',
    normalized
  )

  console.log(
    '🔥 DISCOVER TOPOLOGY',
    {

      products:
        normalized?.products?.length,

      clusters:
        normalized?.clusters?.length,

      paths:
        normalized?.paths?.length,

      recommendations:
        normalized?.recommendations?.length,

      intents:
        normalized?.intents?.length,
    }
  )

  // ======================================
  // Return
  // ======================================

  return normalized
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchDiscover