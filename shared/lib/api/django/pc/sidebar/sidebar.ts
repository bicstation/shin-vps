// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/sidebar/sidebar.ts
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

  normalizeSidebar,

} from './normalize'

/* =========================================
🔥 Endpoint
========================================= */

const SIDEBAR_ENDPOINT =
  '/general/pc-sidebar-stats/'

/* =========================================
🔥 Fetch Sidebar
========================================= */

export async function
fetchSidebar() {

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    buildEndpoint(
      SIDEBAR_ENDPOINT
    )

  // ======================================
  // Fetch
  // ======================================

  const response =

    await safeFetch(
      endpoint
    )

  // ======================================
  // Debug
  // ======================================

  console.log(
    '\n🔥 ====================================='
  )

  console.log(
    '🔥 SIDEBAR API RAW RESPONSE'
  )

  console.log(

    JSON.stringify(
      response,
      null,
      2
    )
  )

  console.log(
    '🔥 =====================================\n'
  )

  // ======================================
  // Temporary Raw Return
  // ======================================
  // IMPORTANT:
  // bypass normalize for payload inspection
  // ======================================

  return response

  // ======================================
  // Normalize
  // ======================================
  // return normalizeSidebar(
  //   response
  // )
}