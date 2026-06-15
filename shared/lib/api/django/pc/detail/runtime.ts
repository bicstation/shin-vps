// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/detail/runtime.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * PC Detail Runtime Pipeline
 *
 * IMPORTANT:
 *
 * This runtime pipeline exists for:
 *
 * semantic runtime observability
 *
 * NOT:
 *
 * normalized UI rendering
 *
 * Responsibilities:
 *
 * - raw semantic payload transport
 * - semantic runtime preservation
 * - runtime observability support
 * - semantic authority exposure
 *
 * IMPORTANT:
 *
 * This pipeline MUST NOT:
 *
 * ❌ normalize semantic meaning
 * ❌ flatten adaptive runtime
 * ❌ mutate traversal semantics
 * ❌ transform grouped attributes
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  PCDetailResponse,

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
🔥 Endpoint
============================================================================ */

const DETAIL_RUNTIME_ENDPOINT =

  '/pc/products'

/* ============================================================================
🔥 Fetch PC Detail Runtime
============================================================================ */

/**
 * Runtime Observatory Pipeline
 *
 * IMPORTANT:
 *
 * Returns:
 *
 * raw semantic runtime payload
 *
 * NOT:
 *
 * normalized product structure
 */
export async function fetchPCDetailRuntime(

  uniqueId: string

): Promise<PCDetailResponse | null> {

  // ======================================
  // Empty Guard
  // ======================================

  if (!uniqueId) {

    console.warn(

      '⚠️ DETAIL RUNTIME EMPTY UNIQUE ID'
    )

    return null
  }

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    buildEndpoint(

      `${DETAIL_RUNTIME_ENDPOINT}/${uniqueId}/`

    )

  // ======================================
  // Runtime Debug
  // ======================================

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(

    '🔥 DETAIL RUNTIME FETCH START'
  )

  console.log(

    {

      uniqueId,

      endpoint,

      pipeline:
        'semantic-runtime-authority',
    }
  )

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  // ======================================
  // Fetch Runtime
  // ======================================

  const response =

    await safeFetch<PCDetailResponse>(
      endpoint
    )

  // ======================================
  // Invalid Response
  // ======================================

  if (!response) {

    console.error(

      '🔥 DETAIL RUNTIME FETCH FAILURE',

      {

        uniqueId,

        endpoint,
      }
    )

    return null
  }

  // ======================================
  // Semantic Runtime Debug
  // ======================================

  console.log(

    '🔥 DETAIL RUNTIME RESPONSE',

    {

      uniqueId,

      endpoint,

      semantic_schema_version:

        (response as any)
          ?.semantic_schema_version,

      has_semantic_runtime:

        !!(response as any)
          ?.semantic_runtime,

      has_adaptive_runtime:

        !!(response as any)
          ?.adaptive_runtime,

      has_semantic_related:

        !!(response as any)
          ?.semantic_related,

      payload_keys:

        Object.keys(
          response || {}
        ),

      payload:
        response,
    }
  )

  // ======================================
  // Success
  // ======================================

  return response
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchPCDetailRuntime