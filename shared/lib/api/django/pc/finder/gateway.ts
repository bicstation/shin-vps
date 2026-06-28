// ============================================================================
// FILE:
// shared/lib/api/django/pc/finder/gateway.ts
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Runtime Gateway V2
 * ============================================================================
 *
 * PURPOSE
 *
 * POST /api/pc/finder/
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

    FinderRuntimeContract,

    FinderRequest,

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

const FINDER_ENDPOINT =

    '/pc/finder/'

/* ============================================================================
🔥 Fetch Finder Runtime
============================================================================ */

export async function fetchFinderRuntime(

    request: FinderRequest,

): Promise<FinderRuntimeContract | null> {

    const endpoint =

        buildEndpoint(

            FINDER_ENDPOINT

        )

    /* ------------------------------------------------------------------------
    Observability
    ------------------------------------------------------------------------ */

    console.log(

        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

    )

    console.log(

        '🔥 FETCH FINDER RUNTIME'

    )

    console.log({

        endpoint,

        request,

    })

    console.log(

        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

    )

    /* ------------------------------------------------------------------------
    Transport
    ------------------------------------------------------------------------ */

    const payload =

        await safeFetch<FinderRuntimeContract>(

            endpoint,

            {

                method: 'POST',

                body: JSON.stringify(

                    request

                ),

            }

        )

    /* ------------------------------------------------------------------------
    RAW Runtime
    ------------------------------------------------------------------------ */

    console.log(

        '🔥 FINDER RAW PAYLOAD',

        payload

    )

    return payload
}

export default fetchFinderRuntime