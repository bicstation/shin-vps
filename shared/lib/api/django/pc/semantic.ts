// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/semantic.ts

/* =========================================
🔥 Contracts
========================================= */

import type {

  SemanticNavigation,

} from './contracts/semantic.contract'

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
🔥 Normalize
========================================= */

import {
  normalizeSemanticNavigation,
} from './normalization/normalizeSemantic'

import {
  normalizeSidebar,
} from './normalization/normalizeSidebar'

/* =========================================
🔥 Legacy API
========================================= */

import {
  fetchSidebarStats,
} from './stats'

/* =========================================
🔥 Endpoint
========================================= */

const SEMANTIC_ENDPOINT =
  '/general/semantic-navigation/'

/* =========================================
🔥 Fetch Semantic Navigation
========================================= */

export async function
fetchSemanticNavigation():
Promise<
  SemanticNavigation
> {

  try {

    // ====================================
    // Endpoint
    // ====================================

    const endpoint =
      buildEndpoint(
        SEMANTIC_ENDPOINT
      )

    // ====================================
    // Fetch
    // ====================================

    const response =
      await safeFetch(
        endpoint
      )

    // ====================================
    // Normalize
    // ====================================

    return normalizeSemanticNavigation(
      response
    )

  } catch {

    // ====================================
    // Fallback
    // Legacy Sidebar Adapter
    // ====================================

    const sidebar =
      await fetchSidebarStats()

    return normalizeSidebar(
      sidebar
    )
  }
}

