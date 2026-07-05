// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/ranking.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Gateway
 * ============================================================================
 *
 * PURPOSE
 *
 * Transport the Backend Ranking API into the
 * Canonical Ranking Backend Contract.
 *
 * Frontend
 *      ↓
 * Gateway
 *      ↓
 * Backend Ranking API
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Gateway Responsibilities
 *
 * ✓ Resolve Endpoint
 * ✓ Transport Backend API
 * ✓ Observe Runtime
 *
 * Gateway SHALL NOT
 *
 * ✗ Normalize Contract
 * ✗ Compose Runtime
 * ✗ Project View Model
 * ✗ Generate Meaning
 * ✗ Generate UI
 *
 * ============================================================================
 */

import type {

    SemanticRankingRuntime,

} from './contracts'

import {

    buildEndpoint,

} from '../utils/buildEndpoint'

import {

    safeFetch,

} from '../utils/safeFetch'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const RANKING_ENDPOINT =

    '/pc/ranking'

/* ============================================================================
🔥 Fetch Ranking Contract
============================================================================ */

export async function fetchRanking(

    slug: string,

): Promise<SemanticRankingRuntime | null> {

    /* ------------------------------------------------------------------------
    Endpoint
    ------------------------------------------------------------------------ */

    const endpoint =

        buildEndpoint(

            `${RANKING_ENDPOINT}/${encodeURIComponent(slug)}/`

        )

    /* ------------------------------------------------------------------------
    Observatory
    ------------------------------------------------------------------------ */

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '🔥 FETCH RANKING'
    )

    console.log({

        slug,

        endpoint,

    })

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ------------------------------------------------------------------------
    Transport
    ------------------------------------------------------------------------ */

    const payload =

        await safeFetch<SemanticRankingRuntime>(

            endpoint,

            {

                method: 'GET',

            }

        )

    /* ------------------------------------------------------------------------
    Raw Observability
    ------------------------------------------------------------------------ */

    console.log(

        '🔥 RANKING RAW',

        payload

    )

    /* ------------------------------------------------------------------------
    Return Backend Contract
    ------------------------------------------------------------------------ */

    return payload

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const getRanking =

    fetchRanking

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchRanking