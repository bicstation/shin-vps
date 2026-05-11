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
  // Invalid Response
  // ======================================

  if (
    !response
    ||
    !response.success
  ) {

    return {

      cpu: [],

      device: [],

      gpu: [],

      maker: [],

      memory: [],

      storage: [],

      usage: [],
    }
  }

  // ======================================
  // Normalize
  // ======================================

  return normalizeSidebar(
    response
  )
}