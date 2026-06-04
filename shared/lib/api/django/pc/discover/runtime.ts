// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/runtime.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Discover Runtime Continuity
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * semantic exploration runtime continuity
 *
 * NOT:
 *
 * semantic authority generation
 *
 * Responsibilities:
 *
 * - discover runtime stabilization
 * - topology continuity absorption
 * - canonical discover runtime exposure
 * - observability-safe runtime continuity
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
🔥 Normalize
============================================================================ */

import {

  normalizeDiscoverRuntime,

} from './normalize'

/* ============================================================================
🔥 Observatory
============================================================================ */

import {

  inspectDiscoverRuntime,

} from './observatory'

/* ============================================================================
🔥 Create Discover Runtime
============================================================================ */

/**
 * IMPORTANT:
 *
 * This layer intentionally avoids:
 *
 * - semantic inference
 * - recommendation generation
 * - exploration rewriting
 * - workflow mutation
 *
 * This layer ONLY stabilizes:
 *
 * discover runtime continuity.
 */
export function createDiscoverRuntime(

  payload?: any

): DiscoverRuntime {

  // ======================================
  // Normalize
  // ======================================

  const normalized =

    normalizeDiscoverRuntime(
      payload
    )

  // ======================================
  // Observatory
  // ======================================

  const observatory =

    inspectDiscoverRuntime(
      normalized
    )

  // ======================================
  // Runtime Debug
  // ======================================

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 DISCOVER RUNTIME'
  )

  console.log({

    products:
      normalized?.products?.length,

    clusters:
      normalized?.clusters?.length,

    intents:
      normalized?.intents?.length,

    paths:
      normalized?.paths?.length,

    recommendations:
      normalized?.recommendations?.length,

    continuity:
      observatory?.continuity
        ?.continuity_status,
  })

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  // ======================================
  // Return
  // ======================================

  return {

    ...normalized,

    observatory: {

      topology_source:
        normalized?.observatory
          ?.topology_source

        || 'discover-runtime',

      continuity_status:

        observatory?.success

          ? 'healthy'

          : 'warning',

      normalized: true,

      runtime_path:
        'discover/runtime',

      warnings:
        observatory?.warnings || [],
    },
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default createDiscoverRuntime