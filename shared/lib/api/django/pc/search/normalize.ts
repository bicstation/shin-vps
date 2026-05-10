// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/search/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Contracts
========================================= */

import type {

  SemanticSearchResponse,

} from './contracts'

/* =========================================
🔥 Normalize Semantic Search
========================================= */

export function
normalizeSemanticSearch(

  payload?: any

): SemanticSearchResponse<any> {

  // ======================================
  // Safe Results
  // ======================================

  const results =

    Array.isArray(
      payload?.results
    )

      ? payload.results

      : Array.isArray(
          payload
        )

          ? payload

          : []

  // ======================================
  // Total
  // ======================================

  const total =

    typeof payload?.total ===
    'number'

      ? payload.total

      : results.length

  // ======================================
  // Semantic Schema Version
  // ======================================

  const semanticSchemaVersion =

    typeof
    payload?.semantic_schema_version
    === 'number'

      ? payload
          .semantic_schema_version

      : 1

  // ======================================
  // Response
  // ======================================

  return {

    results,

    total,

    semantic_schema_version:
      semanticSchemaVersion,
  }
}