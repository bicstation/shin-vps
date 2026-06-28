// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/discover-detail/detail.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

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
  DiscoverDetailRuntime,
} from './contracts'

/* ============================================================================
🔥 Normalize
============================================================================ */

import {
  normalizeDiscoverDetailRuntime,
} from './normalize'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const DISCOVER_DETAIL_ENDPOINT =
  '/pc/discover'

/* ============================================================================
🔥 Fetch Discover Detail Runtime
============================================================================ */

export async function fetchDiscoverDetail(

  slug: string

): Promise<DiscoverDetailRuntime> {

  if (!slug) {
  
    return {

      found: false,

      group_slug: '',

      aliases: [],

      related_groups: [],

      sample_products: [],
    }
  }

  const endpoint =

    buildEndpoint(
      `${DISCOVER_DETAIL_ENDPOINT}/${slug}/`
    )

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 FETCH DISCOVER DETAIL'
  )

  console.log({
    slug,
    endpoint,
  })

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  const payload =

    await safeFetch(
      endpoint
    )

    console.log("🔥 AFTER SAFEFETCH")

    const runtime = normalizeDiscoverDetailRuntime(payload)

    console.log("🔥 AFTER NORMALIZE")

    return runtime


  // // return normalizeDiscoverDetailRuntime(
  //   payload
  // )
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchDiscoverDetail