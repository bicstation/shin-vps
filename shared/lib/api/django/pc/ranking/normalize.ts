// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/ranking/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Ranking Normalize Layer
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * frontend-safe semantic collection stabilization
 *
 * NOT:
 *
 * semantic ranking generation
 *
 * Responsibilities:
 *
 * - shallow-safe collection shaping
 * - semantic runtime preservation
 * - payload stabilization
 * - collection fallback safety
 *
 * IMPORTANT:
 *
 * This layer MUST NOT:
 *
 * ❌ rerank semantic collections
 * ❌ infer workflow meaning
 * ❌ generate semantic labels
 * ❌ mutate traversal semantics
 * ❌ generate grouped exploration
 * ❌ rewrite semantic runtime meaning
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  SemanticRankingRuntime,

} from './contracts'

/* ============================================================================
🔥 Normalize Ranking
============================================================================ */

/**
 * Normalize ranking payload.
 *
 * IMPORTANT:
 *
 * This layer intentionally avoids:
 *
 * - semantic inference
 * - ranking mutation
 * - traversal generation
 * - workflow rewriting
 *
 * Backend remains semantic authority.
 */
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
  // Ranking Results
  // ======================================

  const runtimePayload = payload as any

  const rankingResults =

    Array.isArray(
      runtimePayload?.ranking?.results
    )

      ? runtimePayload.ranking.results

    : Array.isArray(
        runtimePayload?.results
      )

      ? runtimePayload.results

    : Array.isArray(
        runtimePayload?.products
      )

      ? runtimePayload.products

    : Array.isArray(
        runtimePayload?.ranking_products
      )

      ? runtimePayload.ranking_products

    : Array.isArray(
        runtimePayload?.items
      )

      ? runtimePayload.items

    : []

  const total =

    runtimePayload?.ranking?.total

    ?? runtimePayload?.count

    ?? runtimePayload?.total

    ?? rankingResults.length

    ?? 0

    // ======================================
    // Minimal Semantic Normalize
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

      payload?.success
      || false,

    // ====================================
    // Ranking Runtime
    // ====================================

    ranking: {

      results:
        rankingResults,

      total:
        payload?.ranking?.total
        || 0,

      page:
        payload?.ranking?.page
        || 1,

      limit:
        payload?.ranking?.limit
        || 0,
    },

    // ====================================
    // Semantic Runtime
    // ====================================

    semantic_runtime:

      payload?.semantic_runtime
      || {},

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
      || {},

    semantic_graph:

      Array.isArray(
        payload?.semantic_graph
      )

        ? payload.semantic_graph

        : [],

    render_hints:

      payload?.render_hints
      || {},

    adaptive_runtime:

      payload?.adaptive_runtime
      || {},

    // ====================================
    // SEO
    // ====================================

    seo:

      payload?.seo
      || {},

    // ====================================
    // FAQ
    // ====================================

    faq:

      Array.isArray(
        payload?.faq
      )

        ? payload.faq

        : [],

    // ====================================
    // Breadcrumbs
    // ====================================

    breadcrumbs:

      Array.isArray(
        payload?.breadcrumbs
      )

        ? payload.breadcrumbs

        : [],

    // ====================================
    // Schemas
    // ====================================

    schemas:

      payload?.schemas
      || {},

    // ====================================
    // Schema Version
    // ====================================

    semantic_schema_version:

      payload?.semantic_schema_version
      || 1,

    // ====================================
    // Raw Backup
    // ====================================

    raw:
      payload,
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeRanking