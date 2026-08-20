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
    type ProductFilters,
} from './products'

import {
    projectProducts,
    type ProjectedProductsRuntime,
} from './projection'

/* ============================================================================
🔥 Runtime Facade
============================================================================ */

export async function getProductsRuntime(
    page = 1,
    pageSize = 20,
    filters: ProductFilters = {},
): Promise<ProjectedProductsRuntime> {

    const runtime =
        await fetchProducts(
            page,
            pageSize,
            filters,
        )

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