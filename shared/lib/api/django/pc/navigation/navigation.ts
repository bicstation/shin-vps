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
 * Transport the Backend Navigation JSON into the
 * Canonical Navigation Backend Contract.
 *
 * Backend Navigation JSON
 *      ↓
 * Transport
 *      ↓
 * Normalize
 *      ↓
 * Navigation Backend Contract
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Gateway Responsibilities
 *
 * ✓ Resolve Endpoint
 * ✓ Transport Runtime
 * ✓ Invoke Normalize
 * ✓ Observe Runtime
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
🔥 Fetch Navigation Contract
============================================================================ */

export async function fetchNavigationRuntime(

): Promise<NavigationRuntimeContract> {

    const endpoint =

        buildEndpoint(

            NAVIGATION_ENDPOINT

        )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '🔥 FETCH NAVIGATION'
    )

    console.log({

        endpoint,

    })

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    const payload =

        await safeFetch<NavigationRuntimeContract>(

            endpoint

        )

    console.log(

        '🔥 NAVIGATION RAW',

        payload

    )

    if (!payload) {

        console.warn(

            '⚠️ NAVIGATION EMPTY'

        )

        return normalizeNavigation()

    }

    const contract =

        normalizeNavigation(

            payload

        )

    console.log(

        '🔥 NAVIGATION CONTRACT',

        {

            intents:

                contract.intents.length,

            semantic_schema_version:

                contract.semantic_schema_version,

            authority_version:

                contract.authority_version,

            semantic_authority:

                contract.semantic_authority,

            ready:

                contract.ready,

            sample:

                contract.intents[0],

        }

    )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    return contract

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