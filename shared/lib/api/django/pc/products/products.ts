// ============================================================================
// FILE:
// /shared/lib/api/django/pc/products/products.ts
// ============================================================================

import type { ProductsRuntimeContract } from './contracts'
import { buildEndpoint } from '../utils/buildEndpoint'
import { safeFetch } from '../utils/safeFetch'
import { normalizeProducts } from './normalize'

const PRODUCTS_ENDPOINT = '/pc/products/'

export type ProductFilters = {
    sort?: string
    maker?: string
    cpu?: string
    gpu?: string
    memory?: string
    storage?: string
}

export async function fetchProducts(
    page = 1,
    pageSize = 20,
    filters: ProductFilters = {},
): Promise<ProductsRuntimeContract> {

    const params = new URLSearchParams()

    params.set(
        'page',
        String(page),
    )

    params.set(
        'page_size',
        String(pageSize),
    )

    params.set(
        'sort',
        filters.sort ?? 'new',
    )

    if (filters.maker) {
        params.set(
            'maker',
            filters.maker,
        )
    }

    if (filters.cpu) {
        params.set(
            'cpu',
            filters.cpu,
        )
    }

    if (filters.gpu) {
        params.set(
            'gpu',
            filters.gpu,
        )
    }

    if (filters.memory) {
        params.set(
            'memory',
            filters.memory,
        )
    }

    if (filters.storage) {
        params.set(
            'storage',
            filters.storage,
        )
    }

    const endpoint = buildEndpoint(
        `${PRODUCTS_ENDPOINT}?${params.toString()}`
    )

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔥 FETCH PRODUCTS')
    console.log({
        endpoint,
        page,
        pageSize,
        filters,
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const payload =
        await safeFetch<ProductsRuntimeContract>(
            endpoint
        )

    if (!payload) {

        console.warn(
            '⚠️ PRODUCTS EMPTY'
        )

        return normalizeProducts()

    }

    const products =
        normalizeProducts(
            payload
        )

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

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return products

}

export const fetchProductsRuntime =
    fetchProducts

export default fetchProducts