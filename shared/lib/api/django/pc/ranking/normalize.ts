// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/normalize.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Normalize
 * ============================================================================
 *
 * PURPOSE
 *
 * Convert the Backend Ranking API into the
 * Canonical Ranking Backend Contract.
 *
 * Backend Ranking API
 *      ↓
 * Contract Guarantee
 *      ↓
 * Ranking Backend Contract
 *
 * Normalize Responsibilities
 *
 * ✓ Preserve Backend Reality
 * ✓ Guarantee Contract Safety
 * ✓ Null Safety
 * ✓ Array Safety
 *
 * Normalize SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Presentation
 * ✗ Generate Authority
 * ✗ Generate UI
 * ✗ Generate Runtime
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * ============================================================================
 */

import type {

    SemanticRankingRuntime,

    RankingData,

    RankingCategory,

} from './contracts'

/* ============================================================================
🔥 Normalize Ranking
============================================================================ */

export function normalizeRankingRuntime(

    runtime?: Partial<SemanticRankingRuntime>

): SemanticRankingRuntime {

    return {

        /* --------------------------------------------------------------------
        Status
        -------------------------------------------------------------------- */

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
🔥 Normalize Category
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

            data?.product_count ?? 0,

        products:

            data?.products ?? [],

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const normalizeRanking =

    normalizeRankingRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeRankingRuntime