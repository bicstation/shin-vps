// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/stats.ts

/* =========================================
🔥 Utils
========================================= */

import {
  buildEndpoint,
} from './utils/buildEndpoint'

import {
  safeFetch,
} from './utils/safeFetch'

/* =========================================
🔥 Endpoint
========================================= */

const SIDEBAR_STATS_ENDPOINT =
  '/general/pc-sidebar-stats/'

/* =========================================
🔥 Sidebar Stats
========================================= */

export async function
fetchSidebarStats() {

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =
    buildEndpoint(
      SIDEBAR_STATS_ENDPOINT
    )

  // ======================================
  // Fetch
  // ======================================

  return safeFetch(
    endpoint
  )
}

