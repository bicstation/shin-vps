// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/detail/detail.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Contracts
========================================= */

import type {

  PCDetailResponse,

  PCProduct,

} from './contracts'

/* =========================================
🔥 Utils
========================================= */

import {

  buildEndpoint,

} from '../utils/buildEndpoint'

import {

  safeFetch,

} from '../utils/safeFetch'

/* =========================================
🔥 Normalize
========================================= */

import {

  normalizeDetail,

} from './normalize'

/* =========================================
🔥 Endpoint
========================================= */

const DETAIL_ENDPOINT =
  '/general/pc-products'

/* =========================================
🔥 Fetch Detail
========================================= */

export async function
fetchPCDetail(

  uniqueId: string

): Promise<PCProduct | null> {

  // ======================================
  // Empty Guard
  // ======================================

  if (!uniqueId) {

    return null
  }

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    buildEndpoint(

      `${DETAIL_ENDPOINT}/${uniqueId}/`
    )

  // ======================================
  // Fetch
  // ======================================

  const response =

    await safeFetch<PCDetailResponse>(
      endpoint
    )

  // ======================================
  // Invalid Response
  // ======================================

  if (
    !response
    ||
    !response.success
    ||
    !response.product
  ) {

    return null
  }

  console.log(endpoint)

  // ======================================
  // Normalize
  // ======================================

  return normalizeDetail(

    response.product
  )
}