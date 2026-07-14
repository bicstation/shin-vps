// ============================================================================
// FILE:
// /shared/lib/api/django/pc/product-detail/runtime.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Product Detail Runtime Facade
 * ============================================================================
 *
 * PURPOSE
 *
 * Temporary compatibility facade.
 *
 * Product Detail does NOT require Runtime Composition.
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

import {

    fetchProductDetail,

} from './detail'

import {

    projectProductDetail,

    type ProjectedProductDetailRuntime,

} from './projection'

/* ============================================================================
🔥 Runtime Facade
============================================================================ */

export async function getProductDetailRuntime(

    uniqueId: string,

): Promise<ProjectedProductDetailRuntime> {

    /* ------------------------------------------------------------------------
    Runtime
    ------------------------------------------------------------------------ */

    const runtime =

        await fetchProductDetail(

            uniqueId

        )

    /* ------------------------------------------------------------------------
    Projection
    ------------------------------------------------------------------------ */

    return projectProductDetail(

        runtime

    )

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchProjectedProductDetailRuntime =

    getProductDetailRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default getProductDetailRuntime