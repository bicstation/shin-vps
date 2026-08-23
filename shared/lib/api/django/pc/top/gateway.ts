// ============================================================================
// FILE:
// /home/maya/shin-vps/shared/lib/api/django/pc/top/gateway.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Top Runtime Gateway
 * ============================================================================
 *
 * PURPOSE
 *
 * GET /api/pc/top/
 *
 * Frontend
 *      ↓
 * Gateway
 *      ↓
 * Backend Top Runtime
 *
 * Gateway Responsibilities
 *
 * ✓ Transport
 * ✓ HTTP Contract
 * ✓ Observability
 *
 * Gateway SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate SEO
 * ✗ Generate Presentation
 * ✗ Generate Statistics
 * ✗ Rebuild Semantic Runtime
 * ✗ Re-rank Featured Groups
 * ✗ Re-rank Featured Products
 * ✗ Normalize Runtime
 * ✗ Project Runtime
 *
 * Backend remains:
 *
 * Semantic Authority
 * Reality Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Utils
============================================================================ */

import {

    buildEndpoint,

} from '../utils/buildEndpoint'

import {

    safeFetch,

} from '../utils/safeFetch'

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

    TopRuntimeContract,

} from './contracts'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const TOP_ENDPOINT =

    '/pc/top/'

/* ============================================================================
🔥 Fetch Top Runtime
============================================================================ */

/**
 * Transport the Backend Top Runtime.
 *
 * IMPORTANT
 *
 * This function returns the Backend payload through the
 * established transport boundary.
 *
 * It does NOT:
 *
 * - normalize
 * - project
 * - reinterpret
 * - reorder
 * - filter
 * - generate semantic meaning
 */

export async function fetchTopRuntime(

): Promise<TopRuntimeContract | null> {

    /* ------------------------------------------------------------------------
    Endpoint
    ------------------------------------------------------------------------ */

    const endpoint =

        buildEndpoint(

            TOP_ENDPOINT

        )

    /* ------------------------------------------------------------------------
    Observability
    ------------------------------------------------------------------------ */

    console.log(

        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

    )

    console.log(

        '🔥 FETCH TOP RUNTIME'

    )

    console.log(

        'ENDPOINT',

        endpoint

    )

    console.log(

        'METHOD',

        'GET'

    )

    console.log(

        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

    )

    /* ------------------------------------------------------------------------
    Transport
    ------------------------------------------------------------------------ */

    const payload =

        await safeFetch<TopRuntimeContract>(

            endpoint,

            {

                method:
                    'GET',

            }

        )

    /* ------------------------------------------------------------------------
    Raw Backend Runtime
    ------------------------------------------------------------------------ */

    console.log(

        '🔥 TOP RAW PAYLOAD',

        payload

    )

    /* ------------------------------------------------------------------------
    Transport Failure
    ------------------------------------------------------------------------ */

    if (!payload) {

        console.warn(

            '⚠️ TOP RUNTIME EMPTY'

        )

        return null

    }

    /* ------------------------------------------------------------------------
    Runtime Observability
    ------------------------------------------------------------------------ */

    console.log(

        '🔥 TOP BACKEND RUNTIME',

        {

            identity:
                payload?.meaning?.identity,

            products:
                payload?.data?.stats?.product_count,

            groups:
                payload?.data?.stats?.group_count,

            attributes:
                payload?.data?.stats?.attribute_count,

            featured_groups:
                Array.isArray(
                    payload?.data?.featured_groups
                )
                    ? payload.data.featured_groups.length
                    : 0,

            featured_products:
                Array.isArray(
                    payload?.data?.featured_products
                )
                    ? payload.data.featured_products.length
                    : 0,

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

    return payload

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchTop =

    fetchTopRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchTopRuntime