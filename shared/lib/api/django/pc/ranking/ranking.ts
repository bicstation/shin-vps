// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/ranking.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Runtime Gateway
 * ============================================================================
 *
 * PURPOSE
 *
 * GET /api/pc/ranking/{slug}/
 *
 * Frontend
 *      ↓
 * Gateway
 *      ↓
 * Backend Runtime
 *
 * Gateway Responsibilities
 *
 * ✓ Transport
 * ✓ Endpoint Resolution
 * ✓ Observability
 *
 * Gateway SHALL NOT
 *
 * ✗ Normalize Runtime
 * ✗ Compose Runtime
 * ✗ Project Runtime
 * ✗ Generate Meaning
 *
 * ============================================================================
 */

import type {

  SemanticRankingRuntime,

} from './contracts'

import {

  buildEndpoint,

} from '../utils/buildEndpoint'

import {

  safeFetch,

} from '../utils/safeFetch'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const RANKING_ENDPOINT =

  '/pc/ranking'

/* ============================================================================
🔥 Fetch Runtime
============================================================================ */

export async function fetchRanking(

  slug: string,

): Promise<SemanticRankingRuntime | null> {

  /* ------------------------------------------------------------------------
  Endpoint
  ------------------------------------------------------------------------ */

  const endpoint =

    buildEndpoint(

      `${RANKING_ENDPOINT}/${encodeURIComponent(slug)}/`

    )

  /* ------------------------------------------------------------------------
  Observatory
  ------------------------------------------------------------------------ */

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 FETCH RANKING RUNTIME'
  )

  console.log({

    slug,

    endpoint,

  })

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  /* ------------------------------------------------------------------------
  Transport
  ------------------------------------------------------------------------ */

  const payload =

    await safeFetch<SemanticRankingRuntime>(

      endpoint,

      {

        method: 'GET',

      }

    )

  /* ------------------------------------------------------------------------
  RAW Runtime
  ------------------------------------------------------------------------ */

  console.log(

    '🔥 RANKING RAW PAYLOAD',

    payload

  )

  return payload

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const getRanking =

  fetchRanking

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchRanking