// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/options/runtime.ts

// ============================================================================
// FILE:
// /shared/lib/api/django/pc/options/runtime.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Catalog Options Runtime Facade
 * ============================================================================
 *
 * PURPOSE
 *
 * Temporary compatibility facade.
 *
 * Catalog Options does not require Runtime Composition.
 *
 * This facade simply connects:
 *
 * Gateway
 *      ↓
 * Normalize
 *      ↓
 * Projection
 *
 * Backend remains:
 *
 * Reality Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * ============================================================================
 */

import { fetchCatalogOptions } from './options'

import {
    projectCatalogOptions,
    type ProjectedCatalogOptionsRuntime,
} from './projection'

/* ============================================================================
🔥 Runtime Facade
============================================================================ */

export async function getCatalogOptionsRuntime(
): Promise<ProjectedCatalogOptionsRuntime> {

    const runtime =
        await fetchCatalogOptions()

    return projectCatalogOptions(
        runtime
    )

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchProjectedCatalogOptionsRuntime =
    getCatalogOptionsRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default getCatalogOptionsRuntime