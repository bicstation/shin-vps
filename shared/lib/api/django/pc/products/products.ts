// ============================================================================
// FILE:
// /shared/lib/api/django/pc/products/products.ts
// ============================================================================

import type { ProductsRuntimeContract } from './contracts'
import { buildEndpoint } from '../utils/buildEndpoint'
import { safeFetch } from '../utils/safeFetch'
import { normalizeProducts } from './normalize'

const PRODUCTS_ENDPOINT = '/pc/products/'

/* ============================================================================
🔥 Product Filters
============================================================================ */

export type ProductFilters = {

    sort?: string

    maker?: string

    brand?: string

    series?: string

    cpu?: string

    gpu?: string

    memory?: string

    storage?: string

}

/* ============================================================================
🔥 Fetch Products
============================================================================ */

export async function fetchProducts(
    page = 1,
    pageSize = 20,
    filters: ProductFilters = {},
): Promise<ProductsRuntimeContract> {

    const params = new URLSearchParams()

    /* ------------------------------------------------------------------------
    Pagination
    ------------------------------------------------------------------------ */

    params.set(
        'page',
        String(page),
    )

    params.set(
        'page_size',
        String(pageSize),
    )

    /* ------------------------------------------------------------------------
    Sort
    ------------------------------------------------------------------------ */

    params.set(
        'sort',
        filters.sort ?? 'new',
    )

    /* ------------------------------------------------------------------------
    Maker
    ------------------------------------------------------------------------ */

    if (filters.maker) {

        params.set(
            'maker',
            filters.maker,
        )

    }

    /* ------------------------------------------------------------------------
    Brand
    ------------------------------------------------------------------------ */

    if (filters.brand) {

        params.set(
            'brand',
            filters.brand,
        )

    }

    /* ------------------------------------------------------------------------
    Series
    ------------------------------------------------------------------------ */

    if (filters.series) {

        params.set(
            'series',
            filters.series,
        )

    }

    /* ------------------------------------------------------------------------
    CPU
    ------------------------------------------------------------------------ */

    if (filters.cpu) {

        params.set(
            'cpu',
            filters.cpu,
        )

    }

    /* ------------------------------------------------------------------------
    GPU
    ------------------------------------------------------------------------ */

    if (filters.gpu) {

        params.set(
            'gpu',
            filters.gpu,
        )

    }

    /* ------------------------------------------------------------------------
    Memory
    ------------------------------------------------------------------------ */

    if (filters.memory) {

        params.set(
            'memory',
            filters.memory,
        )

    }

    /* ------------------------------------------------------------------------
    Storage
    ------------------------------------------------------------------------ */

    if (filters.storage) {

        params.set(
            'storage',
            filters.storage,
        )

    }

    /* ------------------------------------------------------------------------
    Endpoint
    ------------------------------------------------------------------------ */

    const endpoint =
        buildEndpoint(
            `${PRODUCTS_ENDPOINT}?${params.toString()}`
        )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '🔥 FETCH PRODUCTS'
    )

    console.log({

        endpoint,

        page,

        pageSize,

        filters,

    })

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ------------------------------------------------------------------------
    Fetch
    ------------------------------------------------------------------------ */

    const payload =
        await safeFetch<ProductsRuntimeContract>(
            endpoint
        )

    /* ------------------------------------------------------------------------
    Empty
    ------------------------------------------------------------------------ */

    if (!payload) {

        console.warn(
            '⚠️ PRODUCTS EMPTY'
        )

        return normalizeProducts()

    }

    /* ------------------------------------------------------------------------
    Normalize
    ------------------------------------------------------------------------ */

    const products =
        normalizeProducts(
            payload
        )

    /* ------------------------------------------------------------------------
    Contract Observability
    ------------------------------------------------------------------------ */

    console.log(
        '🔥 PRODUCTS CONTRACT',
        {

            count:
                products.data.count,

            page:
                products.data.page,

            page_size:
                products.data.page_size,

            sort:
                products.data.sort,

            search:
                products.data.search,

            has_next:
                products.data.has_next,

            semantic_schema_version:
                products.semantic_schema_version,

            authority_version:
                products.authority_version,

            semantic_authority:
                products.semantic_authority,

            ready:
                products.ready,

        }
    )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    return products

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchProductsRuntime =
    fetchProducts

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchProducts