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

        '🔥 DISCOVER DETAIL RAW PAYLOAD',

        payload

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