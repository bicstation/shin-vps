// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/sidebar/sidebar.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Contracts
========================================= */

import type {

  SidebarPayload,

  SidebarResponse,

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

  normalizeSidebar,

} from './normalize'

/* =========================================
🔥 Endpoint
========================================= */

const SIDEBAR_ENDPOINT =
  '/general/pc-sidebar-stats/'

/* =========================================
🔥 Empty Sidebar
========================================= */

const EMPTY_SIDEBAR: SidebarPayload = {

  cpu: [],

  device: [],

  gpu: [],

  maker: [],

  memory: [],

  storage: [],

  usage: [],
}

/* =========================================
🔥 Fetch Sidebar
========================================= */

export async function
fetchSidebar()

: Promise<SidebarPayload> {

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    buildEndpoint(
      SIDEBAR_ENDPOINT
    )

  console.log(

    '📦 SIDEBAR ENDPOINT',

    endpoint
  )

  // ======================================
  // Fetch
  // ======================================

  const response =

    await safeFetch<
      SidebarResponse
    >(
      endpoint
    )

  // ======================================
  // Raw Response Observability
  // ======================================

  console.log(

    '📦 SIDEBAR SAFE FETCH RESPONSE',

    response
  )

  console.log(

    '📦 SIDEBAR RESPONSE ANALYSIS',

    {

      exists:
        !!response,

      success:
        response?.success,

      keys:

        Object.keys(
          response || {}
        ),

      hasSidebar:

        !!response?.sidebar,

      sidebarKeys:

        Object.keys(
          response?.sidebar || {}
        ),
    }
  )

  // ======================================
  // Invalid Response
  // ======================================

  if (
    !response
    ||
    !response.success
  ) {

    console.error(

      '❌ SIDEBAR RESPONSE INVALID',

      response
    )

    return EMPTY_SIDEBAR
  }

  // ======================================
  // Normalize Input
  // ======================================

  console.log(

    '📦 SIDEBAR NORMALIZE INPUT',

    {

      success:
        response?.success,

      sidebar:
        response?.sidebar,
    }
  )

  // ======================================
  // Normalize
  // ======================================

  const normalized =

    normalizeSidebar(
      response
    )

  // ======================================
  // Normalize Result
  // ======================================

  console.log(

    '📦 SIDEBAR NORMALIZED RESULT',

    normalized
  )

  // ======================================
  // Return
  // ======================================

  return normalized
}