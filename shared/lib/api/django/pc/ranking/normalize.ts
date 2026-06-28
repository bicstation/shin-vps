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

      success: false,

      meaning: {},

      presentation: {},

      seo: {},

      runtime: {

        count: 0,

        page: 1,

        page_size: 0,

        has_next: false,
      },

      ranking: {

        group_slug: '',

        group_name: '',

        product_count: 0,

        results: [],

        total: 0,

        page: 1,

        limit: 0,
      },

      products: [],

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
  Runtime Metadata
  ========================================================================== */

  const productCount =

    source?.product_count

    ??

    rankingResults.length

  const page =

    source?.page

    ??

    source?.ranking?.page

    ??

    1

  const pageSize =

    source?.page_size

    ??

    source?.limit

    ??

    source?.ranking?.limit

    ??

    rankingResults.length

  const hasNext =

    Boolean(

      source?.has_next

    )

  const group_slug =

    source?.group_slug

    ??

    ''

  const group_name =

    source?.group_name

    ??

    ''

  /* ==========================================================================
  Canonical Projection
  ========================================================================== */

  const products =

    rankingResults

  /* ==========================================================================
  Observability
  ========================================================================== */

  console.log(

    '🔥 RANKING NORMALIZE',

    {

      group_slug,

      group_name,

      product_count:

        productCount,

      page,

      page_size:

        pageSize,

      has_next:

        hasNext,

      products:

        products.length,

      presentation:

        payload?.presentation,

      semantic_schema_version:

        payload?.semantic_schema_version,

      authority_version:

        payload?.authority_version,

      semantic_authority:

        payload?.semantic_authority,

      ready:

        payload?.ready,
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

    runtime: {

      count:

        productCount,

      page,

      page_size:

        pageSize,

      has_next:

        hasNext,
    },

    ranking: {

      group_slug,

      group_name,

      product_count:

        productCount,

      results:

        rankingResults,

      total:

        productCount,

      page,

      limit:

        pageSize,
    },

    products,

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