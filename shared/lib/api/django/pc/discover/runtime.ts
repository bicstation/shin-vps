// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/runtime.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Runtime Facade
 * ============================================================================
 *
 * PURPOSE
 *
 * Canonical entry point for the Discover Adapter.
 *
 * Backend
 *      ↓
 * Gateway
 *      ↓
 * Normalize
 *      ↓
 * Composition
 *      ↓
 * Projection
 *
 * Runtime SHALL:
 *
 * ✓ Orchestrate Adapter Layers
 * ✓ Return Runtime + Projection
 *
 * Runtime SHALL NOT:
 *
 * ✗ Generate Meaning
 * ✗ Generate Runtime
 * ✗ Generate UI
 * ✗ Modify Backend Reality
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

import type {

    DiscoverRuntimeContract,

} from './contracts'

import {

    fetchDiscoverRuntime,

} from './discover'

import {

    normalizeDiscover,

} from './normalize'

import {

    composeDiscoverRuntime,

    type DiscoverExperienceRuntime,

} from './composition'

import {

    projectDiscoverRuntime,

    type ProjectedDiscoverRuntime,

} from './projection'

import {

    fetchNavigationRuntime,

} from '../navigation/navigation'

/* ============================================================================
🔥 Runtime Result
============================================================================ */

export interface DiscoverRuntimeResult {

    runtime: DiscoverExperienceRuntime

    projection: ProjectedDiscoverRuntime

}

/* ============================================================================
🔥 Runtime Facade
============================================================================ */

export async function getDiscoverRuntime(

    groupSlug: string,

): Promise<DiscoverRuntimeResult> {

    /* ------------------------------------------------------------------------
    Navigation
    ------------------------------------------------------------------------ */

    const navigation =

        await fetchNavigationRuntime()

    /* ------------------------------------------------------------------------
    Discover
    ------------------------------------------------------------------------ */

    const discover =

        await fetchDiscoverRuntime(

            groupSlug

        )

    /* ------------------------------------------------------------------------
    Normalize
    ------------------------------------------------------------------------ */

    const normalized =

        normalizeDiscover(

            discover

        )

    /* ------------------------------------------------------------------------
    Composition
    ------------------------------------------------------------------------ */

    const runtime =

        composeDiscoverRuntime(

            navigation,

            normalized,

        )

    /* ------------------------------------------------------------------------
    Projection
    ------------------------------------------------------------------------ */

    const projection =

        projectDiscoverRuntime(

            runtime.discover

        )

    /* ------------------------------------------------------------------------
    Return
    ------------------------------------------------------------------------ */

    return {

        runtime,

        projection,

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchProjectedDiscoverRuntime =

    getDiscoverRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default getDiscoverRuntime