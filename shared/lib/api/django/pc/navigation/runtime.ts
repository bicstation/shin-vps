// ============================================================================
// FILE:
// /shared/lib/api/django/pc/navigation/runtime.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Runtime Facade
 * ============================================================================
 *
 * PURPOSE
 *
 * Temporary compatibility facade.
 *
 * Navigation does not require Runtime Composition.
 *
 * This facade simply connects:
 *
 * Gateway
 *      ↓
 * Normalize
 *      ↓
 * Projection
 *
 * This file exists only for migration compatibility.
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * ============================================================================
 */

import {

    fetchNavigationRuntime,

} from './navigation'

import {

    projectNavigation,

    type ProjectedNavigationRuntime,

} from './projection'

/* ============================================================================
🔥 Runtime Facade
============================================================================ */

export async function getNavigationRuntime(

): Promise<ProjectedNavigationRuntime> {

    const runtime =

        await fetchNavigationRuntime()

    return projectNavigation(

        runtime

    )

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchProjectedNavigationRuntime =

    getNavigationRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default getNavigationRuntime