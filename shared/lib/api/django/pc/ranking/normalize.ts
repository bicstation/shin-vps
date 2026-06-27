// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/normalize.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

import type {

  SemanticRankingRuntime,

} from './contracts'

export function normalizeRanking(

  payload?: any,

): SemanticRankingRuntime {

  /* ==========================================================================
  Empty Guard
  ========================================================================== */

  if (!payload) {

    return {

      meaning: {},

      presentation: {},

      seo: {},

      products: [],

      ranking: {

        results: [],

        total: 0,

        page: 1,

        limit: 0,

      },

      semantic_runtime: {},

      adaptive_runtime: {},

      semantic_labels: [],

      workflow_tags: [],

      grouped_attributes: {},

      semantic_graph: [],

      render_hints: {},

      semantic_schema_version: 1,

      authority_version: '',

      semantic_authority: '',

      ready: false,

      success: false,

      raw: null,
    }

  }

  /* ==========================================================================
  Runtime Source
  ========================================================================== */

  const source =

    payload?.data

    ??

    payload

    ??

    {}

  /* ==========================================================================
  Ranking Results
  ========================================================================== */

  const rankingResults =

    Array.isArray(source?.products)

      ? source.products

    : Array.isArray(source?.results)

      ? source.results

    : Array.isArray(source?.items)

      ? source.items

    : Array.isArray(source?.ranking_products)

      ? source.ranking_products

    : Array.isArray(source?.ranking?.results)

      ? source.ranking.results

    : []

  /* ==========================================================================
  Ranking Metadata
  ========================================================================== */

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

  const page =

    source?.page

    ??

    source?.ranking?.page

    ??

    1

  const limit =

    source?.limit

    ??

    source?.page_size

    ??

    source?.ranking?.limit

    ??

    rankingResults.length

  const group_slug =

    source?.group_slug

    ??

    ''

  const group_name =

    source?.group_name

    ??

    ''

  /* ==========================================================================
  Canonical Products
  ========================================================================== */

  const products =

    rankingResults

  /* ==========================================================================
  Observability
  ========================================================================== */

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

      page,

      limit,

      products:

        products.length,

      presentation:

        payload?.presentation,

    }

  )

  /* ==========================================================================
  Runtime Projection
  ========================================================================== */

  return {

    success:

      payload?.success === true ||

      payload?.ready === true ||

      !!payload?.data ||

      !!payload,

    meaning:

      payload?.meaning

      ||

      {},

    presentation:

      payload?.presentation

      ||

      {},

    seo:

      payload?.seo

      ||

      {},

    products,

    ranking: {

      group_slug,

      group_name,

      results:

        rankingResults,

      total,

      page,

      limit,

    },

    semantic_runtime:

      payload?.semantic_runtime

      ||

      {},

    adaptive_runtime:

      payload?.adaptive_runtime

      ||

      {},

    semantic_labels:

      Array.isArray(payload?.semantic_labels)

        ? payload.semantic_labels

        : [],

    workflow_tags:

      Array.isArray(payload?.workflow_tags)

        ? payload.workflow_tags

        : [],

    grouped_attributes:

      payload?.grouped_attributes

      ||

      {},

    semantic_graph:

      Array.isArray(payload?.semantic_graph)

        ? payload.semantic_graph

        : [],

    render_hints:

      payload?.render_hints

      ||

      {},

    semantic_schema_version:

      payload?.semantic_schema_version

      ??

      1,

    authority_version:

      payload?.authority_version

      ??

      '',

    semantic_authority:

      payload?.semantic_authority

      ??

      '',

    ready:

      payload?.ready

      ??

      false,

    raw:

      payload,
  }

}

export default normalizeRanking