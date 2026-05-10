// //home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder.ts

/* =========================================
🔥 Contracts
========================================= */

import type {

  FinderQuery,

  FinderResponse,

} from './contracts/finder.contract'

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
  normalizeFinder,
} from './normalization/normalizeFinder'

/* =========================================
🔥 Endpoint
========================================= */

const FINDER_ENDPOINT =
  '/general/finder/'

/* =========================================
🔥 Fetch Finder
========================================= */

export async function
fetchFinder(

  query?: FinderQuery
): Promise<
  FinderResponse
> {

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =
    buildEndpoint(

      FINDER_ENDPOINT,

      query
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

  return normalizeFinder(
    response
  )
}

