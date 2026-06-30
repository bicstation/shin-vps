// ============================================================================
// Ranking Normalize V2
// ============================================================================

import type {

  SemanticRankingRuntime,

  RankingData,

} from './contracts'

/* ============================================================================
🔥 Normalize Runtime
============================================================================ */

export function normalizeRanking(

  runtime?: Partial<SemanticRankingRuntime>

): SemanticRankingRuntime {

  return {

    success:

      runtime?.success ?? true,

    /* --------------------------------------------------------------------
    Meaning
    -------------------------------------------------------------------- */

    meaning:

      runtime?.meaning,

    /* --------------------------------------------------------------------
    Presentation
    -------------------------------------------------------------------- */

    presentation:

      runtime?.presentation,

    /* --------------------------------------------------------------------
    SEO
    -------------------------------------------------------------------- */

    seo:

      runtime?.seo,

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

      runtime,
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