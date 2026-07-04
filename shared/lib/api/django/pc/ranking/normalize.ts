// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/normalize.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Runtime Normalize
 * ============================================================================
 *
 * Responsibilities
 *
 * - Runtime Safety
 * - Null Protection
 * - Array Normalization
 *
 * NOT
 *
 * - Runtime Composition
 * - Runtime Projection
 * - Semantic Authority
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Runtime Normalize
 *
 * ============================================================================
 */

import type {

  SemanticRankingRuntime,

  RankingData,

  RankingCategory,

} from './contracts'

/* ============================================================================
🔥 Normalize Runtime
============================================================================ */

export function normalizeRankingRuntime(

  runtime?: Partial<SemanticRankingRuntime>

): SemanticRankingRuntime {

  return {

    success:

      runtime?.success ?? true,

    /* --------------------------------------------------------------------
    Meaning
    -------------------------------------------------------------------- */

    meaning:

      runtime?.meaning ?? {},

    /* --------------------------------------------------------------------
    Presentation
    -------------------------------------------------------------------- */

    presentation:

      runtime?.presentation ?? {},

    /* --------------------------------------------------------------------
    SEO
    -------------------------------------------------------------------- */

    seo:

      runtime?.seo ?? {},

    /* --------------------------------------------------------------------
    Categories
    -------------------------------------------------------------------- */

    categories:

      (runtime?.categories ?? []).map(

        normalizeCategory

      ),

    /* --------------------------------------------------------------------
    Data
    -------------------------------------------------------------------- */

    data:

      normalizeData(

        runtime?.data

      ),

    /* --------------------------------------------------------------------
    Authority
    -------------------------------------------------------------------- */

    semantic_schema_version:

      runtime?.semantic_schema_version,

    authority_version:

      runtime?.authority_version,

    semantic_authority:

      runtime?.semantic_authority,

    ready:

      runtime?.ready ?? false,

    /* --------------------------------------------------------------------
    Raw Backup
    -------------------------------------------------------------------- */

    raw:

      runtime?.raw ?? runtime,

  }

}

/* ============================================================================
🔥 Normalize Categories
============================================================================ */

function normalizeCategory(

  category: RankingCategory

): RankingCategory {

  return {

    ...category,

    groups:

      category.groups ?? [],

  }

}

/* ============================================================================
🔥 Normalize Data
============================================================================ */

function normalizeData(

  data?: Partial<RankingData>

): RankingData {

  return {

    group_slug:

      data?.group_slug ?? '',

    group_name:

      data?.group_name ?? '',

    product_count:

      data?.product_count ??

      data?.products?.length ??

      0,

    products:

      data?.products ?? [],

  }

}

/* ============================================================================
🔥 Alias
============================================================================ */

export const normalizeRanking =

  normalizeRankingRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeRankingRuntime