// ============================================================================
// FILE:
// /shared/lib/api/django/pc/navigation/navigation.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Gateway V2
 * ============================================================================
 *
 * PURPOSE
 *
 * Backend Runtime
 *
 * ↓
 *
 * Transport
 *
 * ↓
 *
 * Normalize
 *
 * ↓
 *
 * Runtime
 *
 * IMPORTANT
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Transport Authority
 *
 * Gateway SHALL
 *
 * ✓ Build Endpoint
 * ✓ Fetch Runtime
 * ✓ Normalize Runtime
 * ✓ Observe Runtime
 *
 * Gateway SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Presentation
 * ✗ Generate Runtime
 * ✗ Generate Projection
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {
    NavigationRuntimeContract,
} from './contracts'

/* ============================================================================
🔥 Endpoint Builder
============================================================================ */

import {
    buildEndpoint,
} from '../utils/buildEndpoint'

/* ============================================================================
🔥 Safe Fetch
============================================================================ */

import {
    safeFetch,
} from '../utils/safeFetch'

/* ============================================================================
🔥 Normalize
============================================================================ */

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

    /* =======================================================================
    Endpoint
    ======================================================================= */

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

    /* =======================================================================
    Fetch
    ======================================================================= */

    const payload =
        await safeFetch<NavigationRuntimeContract>(
            endpoint
        )

    /* =======================================================================
    RAW Observability
    ======================================================================= */

    console.log(
        '🔥 NAVIGATION RAW PAYLOAD',
        payload
    )

    /* =======================================================================
    Empty Runtime
    ======================================================================= */

    if (!payload) {

        console.warn(
            '⚠️ NAVIGATION RUNTIME EMPTY'
        )

        return normalizeNavigation()
    }

    /* =======================================================================
    Normalize
    ======================================================================= */

    const runtime =
        normalizeNavigation(
            payload
        )

    /* =======================================================================
    Runtime Observability
    ======================================================================= */

    console.log(
        '🔥 NAVIGATION NORMALIZED',
        {

            meaning:
                runtime.meaning,

            presentation:
                runtime.presentation,

            seo:
                runtime.seo,

            intents:
                runtime.intents?.length ?? 0,

            semantic_schema_version:
                runtime.semantic_schema_version,

            authority_version:
                runtime.authority_version,

            semantic_authority:
                runtime.semantic_authority,

            ready:
                runtime.ready,

            sample:
                runtime.intents?.[0],
        }
    )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* =======================================================================
    Success
    ======================================================================= */

    return runtime
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchNavigationRuntime