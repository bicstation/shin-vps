// ============================================================================
// FILE:
// /shared/lib/api/django/pc/navigation/navigation.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Gateway
 * ============================================================================
 *
 * PURPOSE
 *
 * Backend Runtime
 *      ↓
 * Transport
 *      ↓
 * Normalize
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Gateway Responsibilities
 *
 * ✓ Resolve Endpoint
 * ✓ Fetch Runtime
 * ✓ Observe Runtime
 * ✓ Normalize Runtime
 *
 * Gateway SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Runtime
 * ✗ Generate Projection
 * ✗ Generate UI
 *
 * ============================================================================
 */

import type {

    NavigationRuntimeContract,

} from './contracts'

import {

    buildEndpoint,

} from '../utils/buildEndpoint'

import {

    safeFetch,

} from '../utils/safeFetch'

import {

    normalizeNavigation,

} from './normalize'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const NAVIGATION_ENDPOINT =

    '/pc/navigation/'

/* ============================================================================
🔥 Fetch Navigation Runtime
============================================================================ */

export async function fetchNavigationRuntime(

): Promise<NavigationRuntimeContract> {

    /* ------------------------------------------------------------------------
    Endpoint
    ------------------------------------------------------------------------ */

    const endpoint =

        buildEndpoint(

            NAVIGATION_ENDPOINT

        )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '🔥 FETCH NAVIGATION RUNTIME'
    )

    console.log({

        endpoint,

    })

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ------------------------------------------------------------------------
    Transport
    ------------------------------------------------------------------------ */

    const payload =

        await safeFetch<NavigationRuntimeContract>(

            endpoint

        )

    /* ------------------------------------------------------------------------
    Raw Observability
    ------------------------------------------------------------------------ */

    console.log(

        '🔥 NAVIGATION RAW PAYLOAD',

        payload

    )

    /* ------------------------------------------------------------------------
    Empty Runtime
    ------------------------------------------------------------------------ */

    if (!payload) {

        console.warn(

            '⚠️ NAVIGATION RUNTIME EMPTY'

        )

        return normalizeNavigation()

    }

    /* ------------------------------------------------------------------------
    Normalize
    ------------------------------------------------------------------------ */

    const runtime =

        normalizeNavigation(

            payload

        )

    /* ------------------------------------------------------------------------
    Runtime Observability
    ------------------------------------------------------------------------ */

    console.log(

        '🔥 NAVIGATION RUNTIME',

        {

            intents:

                runtime.intents.length,

            semantic_schema_version:

                runtime.semantic_schema_version,

            authority_version:

                runtime.authority_version,

            semantic_authority:

                runtime.semantic_authority,

            ready:

                runtime.ready,

            sample:

                runtime.intents[0],

        }

    )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    return runtime

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchNavigation =

    fetchNavigationRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchNavigationRuntime