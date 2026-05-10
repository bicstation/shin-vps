// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/search/search.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Contracts
========================================= */

import type {

  SemanticSearchQuery,

  SemanticSearchResponse,

} from './contracts'

/* =========================================
🔥 Query Builder
========================================= */

import {

  buildSemanticQuery,

} from './queryBuilder'

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

  normalizeSemanticSearch,

} from './normalize'

/* =========================================
🔥 Endpoint
========================================= */

const SEARCH_ENDPOINT =
  '/general/pc-search/'

/* =========================================
🔥 Search
========================================= */

export async function
searchPC(

  query?:
    SemanticSearchQuery

): Promise<
  SemanticSearchResponse<any>
> {

  // ======================================
  // Query String
  // ======================================

  const queryString =

    buildSemanticQuery(
      query
    )

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    buildEndpoint(
      `${SEARCH_ENDPOINT}${queryString}`
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

  return normalizeSemanticSearch(
    response
  )
}

/* =========================================
🔥 Preset Search
========================================= */

export async function
searchGamingPC() {

  return searchPC({

    usage:
      'usage-gaming',
  })
}

export async function
searchCreatorPC() {

  return searchPC({

    usage:
      'usage-creator',
  })
}

export async function
searchBusinessPC() {

  return searchPC({

    usage:
      'usage-business',
  })
}

export async function
searchAIPC() {

  return searchPC({

    usage:
      'usage-ai',
  })
}