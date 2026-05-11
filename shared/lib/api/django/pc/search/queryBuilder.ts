// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/search/queryBuilder.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Contracts
========================================= */

import type {

  SemanticSearchQuery,

} from './contracts'

/* =========================================
🔥 Helper
========================================= */

function appendIfExists(

  params: URLSearchParams,

  key: string,

  value?: string | number
) {

  if (
    value !== undefined
    &&
    value !== null
    &&
    value !== ''
  ) {

    params.set(
      key,
      String(value)
    )
  }
}

/* =========================================
🔥 Query Builder
========================================= */

export function
buildSemanticQuery(

  query?:
    SemanticSearchQuery

): string {

  // ======================================
  // Empty
  // ======================================

  if (!query) {

    return ''
  }

  // ======================================
  // Params
  // ======================================

  const params =
    new URLSearchParams()

  // ======================================
  // Semantic Attributes
  // ======================================

  appendIfExists(
    params,
    'gpu',
    query.gpu
  )

  appendIfExists(
    params,
    'cpu',
    query.cpu
  )

  appendIfExists(
    params,
    'usage',
    query.usage
  )

  appendIfExists(
    params,
    'maker',
    query.maker
  )

  appendIfExists(
    params,
    'memory',
    query.memory
  )

  appendIfExists(
    params,
    'storage',
    query.storage
  )

  appendIfExists(
    params,
    'device',
    query.device
  )

  // ======================================
  // Keyword
  // ======================================

  appendIfExists(
    params,
    'keyword',
    query.keyword
  )

  // ======================================
  // Pagination
  // ======================================

  appendIfExists(
    params,
    'page',
    query.page
  )

  appendIfExists(
    params,
    'limit',
    query.limit
  )

  // ======================================
  // Return
  // ======================================

  const queryString =
    params.toString()

  return queryString
    ? `?${queryString}`
    : ''
}