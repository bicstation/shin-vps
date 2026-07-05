// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/runtime.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Runtime Facade
 * ============================================================================
 *
 * PURPOSE
 *
 * Temporary compatibility facade.
 *
 * Ranking no longer requires Runtime Composition.
 *
 * This facade simply connects:
 *
 * Gateway
 *      ↓
 * Normalize
 *      ↓
 * Projection
 *
 * This file exists only for migration compatibility.
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * ============================================================================
 */

import type {

    SemanticRankingRuntime,

} from './contracts'

import {

    fetchRanking,

} from './ranking'

import {

    normalizeRankingRuntime,

} from './normalize'

import {

    projectRankingRuntime,

    type ProjectedRankingRuntime,

} from './projection'

/* ============================================================================
🔥 Runtime Result
============================================================================ */

export interface RankingRuntimeResult {

    runtime: SemanticRankingRuntime

    projection: ProjectedRankingRuntime

}

/* ============================================================================
🔥 Runtime Facade
============================================================================ */

export async function getRankingRuntime(

    slug: string,

): Promise<RankingRuntimeResult> {

    /* ------------------------------------------------------------------------
    Gateway
    ------------------------------------------------------------------------ */

    const payload =

        await fetchRanking(

            slug

        )

    /* ------------------------------------------------------------------------
    Normalize
    ------------------------------------------------------------------------ */

    const runtime =

        normalizeRankingRuntime(

            payload ?? undefined

        )

    /* ------------------------------------------------------------------------
    Projection
    ------------------------------------------------------------------------ */

    const projection =

        projectRankingRuntime(

            runtime

        )

    /* ------------------------------------------------------------------------
    Return
    ------------------------------------------------------------------------ */

    return {

        runtime,

        projection,

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchProjectedRankingRuntime =

    getRankingRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default getRankingRuntime