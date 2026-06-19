// ============================================================================
// FILE:
// /home/maya/shin-vps/shared/lib/api/django/pc/top/top.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Top Runtime Fetch Layer
 * ============================================================================
 *
 * PURPOSE
 *
 * GET /api/pc/top/
 *
 * ↓
 *
 * Top Runtime
 *
 * IMPORTANT
 *
 * This layer MUST NOT:
 *
 * ❌ generate meaning
 * ❌ generate seo
 * ❌ generate stats
 * ❌ mutate runtime payload
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

  TopRuntime,

} from './contracts'

/* ============================================================================
🔥 Normalize
============================================================================ */

import {

  normalizeTopRuntime,

} from './normalize'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const TOP_ENDPOINT =

  '/pc/top/'

/* ============================================================================
🔥 Fetch Top Runtime
============================================================================ */

export async function fetchTopRuntime(

): Promise<TopRuntime> {

  console.log(
    '🔥 FETCH TOP RUNTIME'
  )

  const endpoint =
    buildEndpoint(
      TOP_ENDPOINT
    )

  console.log(
    '🔥 TOP ENDPOINT',
    endpoint
  )

  const payload =
    await safeFetch(
      endpoint
    )


  console.log(
    '🔥 TOP RAW PAYLOAD',
    payload
  )

  const runtime =

    normalizeTopRuntime(
      payload
    )

  console.log(
    '🔥 TOP RUNTIME',
    {

      identity:
        runtime?.meaning?.identity,

      products:
        runtime?.stats?.product_count,

      groups:
        runtime?.stats?.group_count,

      featured_groups:
        runtime?.featured_groups?.length,

      featured_products:
        runtime?.featured_products?.length,
    }
  )

  return runtime
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchTopRuntime