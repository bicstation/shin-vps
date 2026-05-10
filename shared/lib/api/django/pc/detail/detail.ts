// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/detail/detail.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

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
) {

  // ======================================
  // Empty
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

    await safeFetch(
      endpoint
    )

  // ======================================
  // Normalize
  // ======================================

  return normalizeDetail(
    response
  )
}