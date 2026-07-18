// ============================================================================
// FILE:
// /shared/lib/api/django/pc/products/products.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

import type { ProductsRuntimeContract } from './contracts'
import { buildEndpoint } from '../utils/buildEndpoint'
import { safeFetch } from '../utils/safeFetch'
import { normalizeProducts } from './normalize'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const PRODUCTS_ENDPOINT = '/pc/products/'

/* ============================================================================
🔥 Fetch Products Runtime
============================================================================ */

export async function fetchProducts(
    page = 1,
    pageSize = 20,
): Promise<ProductsRuntimeContract> {

    const endpoint = buildEndpoint(
        `${PRODUCTS_ENDPOINT}?page=${page}&page_size=${pageSize}`
    )

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔥 FETCH PRODUCTS')
    console.log({ endpoint, page, pageSize })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const payload = await safeFetch<ProductsRuntimeContract>(endpoint)

    console.log('🔥 PRODUCTS RAW', payload)

    if (!payload) {
        console.warn('⚠️ PRODUCTS EMPTY')
        return normalizeProducts()
    }

    const products = normalizeProducts(payload)

    console.log('🔥 PRODUCTS CONTRACT', {
        count: products.data.count,
        page: products.data.page,
        page_size: products.data.page_size,
        sort: products.data.sort,
        has_next: products.data.has_next,
        semantic_schema_version: products.semantic_schema_version,
        authority_version: products.authority_version,
        semantic_authority: products.semantic_authority,
        ready: products.ready,
        sample: products.data.products.at(0) ?? null,
    })

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return products
}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchProductsRuntime = fetchProducts

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchProducts