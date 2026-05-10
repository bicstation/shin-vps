// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/search/queryBuilder.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Contracts
========================================= */

import type {

  SemanticSearchQuery,

} from './contracts'

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

  if (query.gpu) {

    params.set(
      'gpu',
      query.gpu
    )
  }

  if (query.cpu) {

    params.set(
      'cpu',
      query.cpu
    )
  }

  if (query.usage) {

    params.set(
      'usage',
      query.usage
    )
  }

  if (query.maker) {

    params.set(
      'maker',
      query.maker
    )
  }

  if (query.memory) {

    params.set(
      'memory',
      query.memory
    )
  }

  if (query.storage) {

    params.set(
      'storage',
      query.storage
    )
  }

  if (query.device) {

    params.set(
      'device',
      query.device
    )
  }

  // ======================================
  // Keyword
  // ======================================

  if (query.keyword) {

    params.set(
      'keyword',
      query.keyword
    )
  }

  // ======================================
  // Pagination
  // ======================================

  if (
    typeof query.page ===
    'number'
  ) {

    params.set(
      'page',
      String(query.page)
    )
  }

  if (
    typeof query.limit ===
    'number'
  ) {

    params.set(
      'limit',
      String(query.limit)
    )
  }

  // ======================================
  // Return
  // ======================================

  const queryString =
    params.toString()

  return queryString
    ? `?${queryString}`
    : ''
}