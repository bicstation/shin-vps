// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover-detail/runtime.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Detail Runtime Facade
 * ============================================================================
 *
 * Responsibilities
 *
 * - Runtime Orchestration
 *
 * NOT
 *
 * - Runtime Fetch
 * - Runtime Normalize
 * - Runtime Composition
 * - Runtime Projection
 * - Semantic Authority
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

    fetchDiscoverDetailRuntime,

} from './gateway'

import {

    normalizeDiscoverDetailRuntime,

} from './normalize'

import {

    composeDiscoverDetailRuntime,

} from './composition'

import {

    projectDiscoverDetailRuntime,

    type ProjectedDiscoverDetailRuntime,

} from './projection'

/* ============================================================================
🔥 Runtime Facade
============================================================================ */

export async function getDiscoverDetailRuntime(

    slug: string,

): Promise<ProjectedDiscoverDetailRuntime> {

    /* ------------------------------------------------------------------------
    Gateway
    ------------------------------------------------------------------------ */

    const raw =

        await fetchDiscoverDetailRuntime(

            slug

        )

    if (!raw) {

        throw new Error(

            'Discover Detail Runtime not found.'

        )

    }

    /* ------------------------------------------------------------------------
    Normalize
    ------------------------------------------------------------------------ */

    const normalized =

        normalizeDiscoverDetailRuntime(

            raw

        )

    /* ------------------------------------------------------------------------
    Composition
    ------------------------------------------------------------------------ */

    const composed =

        composeDiscoverDetailRuntime(

            normalized

        )

    /* ------------------------------------------------------------------------
    Projection
    ------------------------------------------------------------------------ */

    return projectDiscoverDetailRuntime(

        composed.discover

    )

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchProjectedDiscoverDetailRuntime =

    getDiscoverDetailRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default getDiscoverDetailRuntime