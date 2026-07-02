// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover-detail/gateway.ts
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Detail Runtime Gateway V2
 * ============================================================================
 *
 * PURPOSE
 *
 * GET /pc/discover/{slug}/
 *
 * Frontend
 *      ↓
 * Gateway
 *      ↓
 * Backend Runtime
 *
 * Gateway Responsibility
 *
 * ✓ Transport
 * ✓ Endpoint Resolution
 * ✓ Observe
 *
 * Gateway SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Runtime
 * ✗ Normalize Runtime
 * ✗ Project Runtime
 *
 * ============================================================================
 */

import type {

    DiscoverDetailRuntime,

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

const DISCOVER_DETAIL_ENDPOINT =

    '/pc/discover'

/* ============================================================================
🔥 Fetch Runtime
============================================================================ */

export async function fetchDiscoverDetailRuntime(

    slug: string

): Promise<DiscoverDetailRuntime | null> {

    if (!slug) {

        console.warn(
            '⚠️ DISCOVER DETAIL EMPTY SLUG'
        )

        return null
    }

    const endpoint =

        buildEndpoint(

            `${DISCOVER_DETAIL_ENDPOINT}/${encodeURIComponent(slug)}/`

        )

    /* ------------------------------------------------------------------------
    Observability
    ------------------------------------------------------------------------ */

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '🔥 FETCH DISCOVER DETAIL RUNTIME'
    )

    console.log(
        'ENDPOINT'
    )

    console.log(
        endpoint
    )

    console.log(
        'SLUG'
    )

    console.log(
        slug
    )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ------------------------------------------------------------------------
    Transport
    ------------------------------------------------------------------------ */

    const payload =

        await safeFetch<DiscoverDetailRuntime>(

            endpoint,

            {

                method: 'GET',

            }

        )

    /* ------------------------------------------------------------------------
    RAW Runtime
    ------------------------------------------------------------------------ */

    console.log(

        '🔥 DISCOVER DETAIL RAW SUMMARY',

        {

            found:

                payload?.found,

            group_slug:

                payload?.data?.group_slug,

            group_name:

                payload?.data?.group_name,

            presentation_name:

                payload?.data?.presentation_name,

            sibling_groups:

                payload?.data?.sibling_groups?.length ?? 0,

            sample_products:

                payload?.data?.sample_products?.length ?? 0,

            semantic_authority:

                payload?.semantic_authority,

            authority_version:

                payload?.authority_version,

            ready:

                payload?.ready,

        }

    )



    return payload
}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const getDiscoverDetail =

    fetchDiscoverDetailRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchDiscoverDetailRuntime