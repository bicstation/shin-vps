// ============================================================================
// FILE:
// /home/maya/shin-vps/shared/lib/api/django/pc/top/runtime.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Top Runtime Facade
 * ============================================================================
 *
 * PURPOSE
 *
 * Adapter-side Top Runtime orchestration.
 *
 * Pipeline
 *
 * Frontend
 *      ↓
 * getTopRuntime()
 *      ↓
 * Gateway
 *      ↓
 * Backend Top Runtime
 *      ↓
 * Normalize
 *      ↓
 * Projection
 *      ↓
 * ProjectedTopRuntime
 *      ↓
 * Frontend
 *
 * Responsibilities
 *
 * ✓ Runtime Orchestration
 * ✓ Gateway Invocation
 * ✓ Runtime Normalization
 * ✓ Runtime Projection
 * ✓ Observability
 *
 * This facade does NOT:
 *
 * ✗ Generate Meaning
 * ✗ Generate SEO
 * ✗ Generate Presentation
 * ✗ Generate Statistics
 * ✗ Interpret Semantic Groups
 * ✗ Re-rank Featured Groups
 * ✗ Re-rank Featured Products
 * ✗ Filter Products
 * ✗ Modify Backend Reality
 *
 * Backend remains:
 *
 * Semantic Authority
 * Reality Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * Frontend remains:
 *
 * Experience Authority
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Gateway
============================================================================ */

import {

    fetchTopRuntime,

} from './gateway'

/* ============================================================================
🔥 Normalize
============================================================================ */

import {

    normalizeTopRuntime,

} from './normalize'

/* ============================================================================
🔥 Projection
============================================================================ */

import {

    projectTopRuntime,

    type ProjectedTopRuntime,

} from './projection'

/* ============================================================================
🔥 Runtime Contract
============================================================================ */

export type {

    ProjectedTopRuntime,

} from './projection'

/* ============================================================================
🔥 Runtime Facade
============================================================================ */

export async function getTopRuntime(

): Promise<ProjectedTopRuntime> {

    /* ------------------------------------------------------------------------
    Gateway
    ------------------------------------------------------------------------ */

    const runtime =

        await fetchTopRuntime()

    /* ------------------------------------------------------------------------
    Empty Runtime Protection
    ------------------------------------------------------------------------ */

    if (!runtime) {

        console.warn(

            '⚠️ TOP RUNTIME EMPTY'

        )

        return projectTopRuntime(

            normalizeTopRuntime()

        )

    }

    /* ------------------------------------------------------------------------
    Normalize
    ------------------------------------------------------------------------ */

    const normalized =

        normalizeTopRuntime(

            runtime

        )

    /* ------------------------------------------------------------------------
    Projection
    ------------------------------------------------------------------------ */

    const projected =

        projectTopRuntime(

            normalized

        )

    /* ------------------------------------------------------------------------
    Observability
    ------------------------------------------------------------------------ */

    console.log(

        '🔥 TOP RUNTIME READY'

    )

    console.log({

        productCount:
            projected.stats.productCount,

        groupCount:
            projected.stats.groupCount,

        attributeCount:
            projected.stats.attributeCount,

        featuredGroups:
            projected.featuredGroups.length,

        featuredProducts:
            projected.featuredProducts.length,

        authorityVersion:
            projected.authorityVersion,

        semanticAuthority:
            projected.semanticAuthority,

        ready:
            projected.ready,

    })

    return projected

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchProjectedTopRuntime =

    getTopRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default getTopRuntime