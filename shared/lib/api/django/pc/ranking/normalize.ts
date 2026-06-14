// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/ranking/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

import type {
  SemanticRankingRuntime,
} from './contracts'

export function normalizeRanking(

  payload?: any,

): SemanticRankingRuntime | null {

  // ======================================
  // Empty Guard
  // ======================================

  if (!payload) {
    return null
  }

  // ======================================
  // Compatibility Layer
  // Legacy:
  // {
  //   success,
  //   products,
  //   results
  // }
  //
  // Semantic API v3:
  // {
  //   meaning,
  //   seo,
  //   data
  // }
  // ======================================

  const source =

    payload?.data

    ??

    payload

    ??

    {}

  // ======================================
  // Ranking Results
  // ======================================

  const rankingResults =

    Array.isArray(
      source?.products
    )

      ? source.products

    : Array.isArray(
        source?.results
      )

      ? source.results

    : Array.isArray(
        source?.items
      )

      ? source.items

    : Array.isArray(
        source?.ranking_products
      )

      ? source.ranking_products

    : Array.isArray(
        source?.ranking?.results
      )

      ? source.ranking.results

    : []

  // ======================================
  // Total
  // ======================================

  const total =

    source?.product_count

    ??

    source?.count

    ??

    source?.total

    ??

    source?.ranking?.total

    ??

    rankingResults.length

    ??

    0

  // ======================================
  // Group Continuity
  // ======================================

  const group_slug =

    source?.group_slug

    ||

    ''

  const group_name =

    source?.group_name

    ||

    ''

  // ======================================
  // Canonical Products
  // ======================================

  const products =
    rankingResults

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 RANKING NORMALIZE',
    {
      source:
        payload?.data
          ? 'semantic-v3'
          : 'legacy',

      group_slug,

      group_name,

      total,

      products:
        products.length,
    }
  )

  // ======================================
  // Return
  // ======================================

  return {

    // ====================================
    // Preserve Raw Payload
    // ====================================

    ...payload,

    // ====================================
    // Success
    // ====================================

    success:

      payload?.success === true

      ||

      payload?.ready === true

      ||

      !!payload?.data

      ||

      !!payload,

    // ====================================
    // Meaning
    // ====================================

    meaning:

      payload?.meaning

      ||

      {},

    // ====================================
    // Canonical Runtime
    // ====================================

    group_slug,

    group_name,

    products,

    // ====================================
    // Ranking Runtime
    // ====================================

    ranking: {

      results:
        rankingResults,

      total,

      page:

        source?.page

        ??

        source?.ranking?.page

        ??

        1,

      limit:

        source?.limit

        ??

        source?.ranking?.limit

        ??

        rankingResults.length,
    },

    // ====================================
    // Semantic Runtime
    // ====================================

    semantic_runtime:

      payload?.semantic_runtime

      ||

      {},

    semantic_labels:

      Array.isArray(
        payload?.semantic_labels
      )

        ? payload.semantic_labels

        : [],

    workflow_tags:

      Array.isArray(
        payload?.workflow_tags
      )

        ? payload.workflow_tags

        : [],

    grouped_attributes:

      payload?.grouped_attributes

      ||

      {},

    semantic_graph:

      Array.isArray(
        payload?.semantic_graph
      )

        ? payload.semantic_graph

        : [],

    adaptive_runtime:

      payload?.adaptive_runtime

      ||

      {},

    render_hints:

      payload?.render_hints

      ||

      {},

    // ====================================
    // SEO
    // ====================================

    seo:

      payload?.seo

      ||

      {},

    // ====================================
    // Schema Metadata
    // ====================================

    semantic_schema_version:

      payload?.semantic_schema_version

      ||

      1,

    authority_version:

      payload?.authority_version

      ||

      '',

    semantic_authority:

      payload?.semantic_authority

      ||

      '',

    // ====================================
    // Raw Backup
    // ====================================

    raw:
      payload,
  }
}

export default normalizeRanking