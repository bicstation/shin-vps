// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/related/related.ts
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

  normalizeRelated,

} from './normalize'

/* =========================================
🔥 Endpoint
========================================= */

const RELATED_ENDPOINT =
  '/general/pc-products'

/* =========================================
🔥 Fetch Related
========================================= */

export async function
fetchRelatedPC(

  uniqueId: string
) {

  // ======================================
  // Empty
  // ======================================

  if (!uniqueId) {

    return []
  }

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    buildEndpoint(

      `${RELATED_ENDPOINT}/${uniqueId}/related/`
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

  return normalizeRelated(
    response
  )
}