// ============================================================================
// FILE:
// /shared/lib/api/django/pc/finder/runtime.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Runtime Facade
 * ============================================================================
 *
 * Responsibilities
 *
 * - Runtime Orchestration
 *
 * Pipeline
 *
 * Gateway
 *      ↓
 * Normalize
 *      ↓
 * Composition
 *      ↓
 * Projection
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Runtime Facade
 *
 * ============================================================================
 */

import {

    fetchFinderRuntime,

} from './gateway'

import {

    normalizeFinderRuntime,

} from './normalize'

import {

    composeFinderRuntime,

} from './composition'

import {

    projectFinderRuntime,

} from './projection'

import type {

    ProjectedFinderRuntime,

} from './projection'

import type {

    FinderRequest,

} from './contracts'

/* ============================================================================
🔥 Runtime Facade
============================================================================ */

export async function getFinderRuntime(

    request: FinderRequest,

): Promise<ProjectedFinderRuntime> {

    /* ------------------------------------------------------------------------
    Gateway
    ------------------------------------------------------------------------ */

    const runtime =

        await fetchFinderRuntime(

            request

        )

    if (!runtime) {

        throw new Error(

            'Finder Runtime not found.'

        )

    }

    /* ------------------------------------------------------------------------
    Normalize
    ------------------------------------------------------------------------ */

    const normalized =

        normalizeFinderRuntime(

            runtime

        )

    /* ------------------------------------------------------------------------
    Composition
    ------------------------------------------------------------------------ */

    const composed =

        composeFinderRuntime(

            normalized

        )

    /* ------------------------------------------------------------------------
    Projection
    ------------------------------------------------------------------------ */

    const projected =

        projectFinderRuntime(

            composed.finder

        )

    /* ------------------------------------------------------------------------
    Observability
    ------------------------------------------------------------------------ */

    console.log(
        '🔥 FINDER RUNTIME READY'
    )

    console.log({

        runtime:
            'finder-runtime',

        projection:
            true,

        ready:
            true,

    })

    return projected

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchProjectedFinderRuntime =

    getFinderRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default getFinderRuntime