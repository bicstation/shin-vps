// ============================================================================
// FILE:
// /shared/lib/api/django/pc/products/runtime.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Products Runtime Facade
 * ============================================================================
 *
 * PURPOSE
 *
 * Temporary compatibility facade.
 *
 * Products does not require Runtime Composition.
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

    fetchProducts,

} from './products'

import {

    projectProducts,

    type ProjectedProductsRuntime,

} from './projection'

/* ============================================================================
🔥 Runtime Facade
============================================================================ */

export async function getProductsRuntime(

): Promise<ProjectedProductsRuntime> {

    const runtime =

        await fetchProducts()

    return projectProducts(

        runtime

    )

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchProjectedProductsRuntime =

    getProductsRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default getProductsRuntime