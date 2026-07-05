// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/discover.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Gateway
 * ============================================================================
 *
 * PURPOSE
 *
 * Transport Backend Discover Runtime into Adapter Layer.
 *
 * Backend Discover Runtime
 *      ↓
 * Gateway (this file)
 *      ↓
 * Normalize
 *
 * IMPORTANT
 *
 * Gateway SHALL:
 *
 * ✓ Resolve Endpoint
 * ✓ Fetch Runtime
 * ✓ Observe Runtime
 *
 * Gateway SHALL NOT:
 *
 * ✗ Normalize Data
 * ✗ Compose Runtime
 * ✗ Project Runtime
 * ✗ Generate Meaning
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * ============================================================================
 */

import type {
    DiscoverRuntimeContract,
} from './contracts'

import {
    buildEndpoint,
} from '../utils/buildEndpoint'

import {
    safeFetch,
} from '../utils/safeFetch'

import {
    normalizeDiscover,
} from './normalize'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const DISCOVER_ENDPOINT =
    '/pc/discover'

/* ============================================================================
🔥 Fetch Discover Runtime
============================================================================ */

export async function fetchDiscoverRuntime(
    groupSlug: string
): Promise<DiscoverRuntimeContract> {

    /* ------------------------------------------------------------------------
    Endpoint
    ------------------------------------------------------------------------ */

    const endpoint =
        buildEndpoint(
            `${DISCOVER_ENDPOINT}/${encodeURIComponent(groupSlug)}/`
        )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '🔥 FETCH DISCOVER RUNTIME'
    )

    console.log({
        groupSlug,
        endpoint,
    })

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ------------------------------------------------------------------------
    Transport
    ------------------------------------------------------------------------ */

    const payload =
        await safeFetch<DiscoverRuntimeContract>(
            endpoint,
            {
                method: 'GET',
            }
        )

    /* ------------------------------------------------------------------------
    Raw Runtime
    ------------------------------------------------------------------------ */

    console.log(
        '🔥 DISCOVER RAW PAYLOAD',
        payload
    )

    /* ------------------------------------------------------------------------
    Empty Guard
    ------------------------------------------------------------------------ */

    if (!payload) {

        console.warn(
            '⚠️ DISCOVER EMPTY'
        )

        return normalizeDiscover()
    }

    /* ------------------------------------------------------------------------
    Normalize
    ------------------------------------------------------------------------ */

    const runtime =
        normalizeDiscover(payload)

    /* ------------------------------------------------------------------------
    Observability
    ------------------------------------------------------------------------ */

    console.log(
        '🔥 DISCOVER NORMALIZED',
        {

            found:
                runtime.found,

            group:
                runtime.data?.group_slug,

            product_count:
                runtime.data?.product_count,

            semantic_schema_version:
                runtime.semantic_schema_version,

            authority_version:
                runtime.authority_version,

            semantic_authority:
                runtime.semantic_authority,

            ready:
                runtime.ready,

            sample_product:
                runtime.data?.sample_products?.[0],
        }
    )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ------------------------------------------------------------------------
    Return
    ------------------------------------------------------------------------ */

    return runtime
}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchDiscover =
    fetchDiscoverRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchDiscoverRuntime