// ============================================================================
// FILE:
// /home/maya/shin-vps/shared/lib/api/django/pc/semantics/fetchSemanticRuntime.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Runtime Gateway
 * ============================================================================
 *
 * PURPOSE
 *
 * GET /api/pc/semantics/
 *
 * ↓
 *
 * Semantic Runtime
 *
 * IMPORTANT
 *
 * This layer MUST NOT:
 *
 * ❌ generate universes
 * ❌ generate navigation
 * ❌ infer semantic meaning
 * ❌ mutate authority payload
 *
 * RESPONSIBILITY
 *
 * Transport
 * ↓
 * Normalize
 * ↓
 * Runtime
 *
 * ============================================================================
 */

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
🔥 Contracts
============================================================================ */

import type {

  SemanticRuntime,

} from './contracts'

/* ============================================================================
🔥 Normalize
============================================================================ */

import {

  normalizeSemanticRuntime,

} from './normalize'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const SEMANTIC_ENDPOINT =

  '/pc/semantics/'

/* ============================================================================
🔥 Fetch Semantic Runtime
============================================================================ */

export async function fetchSemanticRuntime(

): Promise<SemanticRuntime> {

  console.log(
    '🔥 FETCH SEMANTIC RUNTIME'
  )

  const endpoint =

    buildEndpoint(
      SEMANTIC_ENDPOINT
    )

  console.log(
    '🔥 SEMANTIC ENDPOINT',
    endpoint
  )

  const payload =

    await safeFetch(
      endpoint
    )

  console.log(
    '🔥 SEMANTIC RAW PAYLOAD',
    payload
  )

  const runtime =

    normalizeSemanticRuntime(
      payload
    )
  


  console.log(
    '🔥 SEMANTIC RUNTIME',
    {

      universes:
        runtime?.universes?.length,

      navigation:
        runtime?.navigation?.length,

      sidebar:
        runtime?.sidebar?.length,

      shelves:
        runtime?.discover?.shelves?.length,

      meaning:
        !!runtime?.meaning,

      summary:
        !!runtime?.summary,
    }
  )

  return runtime
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchSemanticRuntime