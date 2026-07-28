// ============================================================================
// FILE:
// /shared/lib/api/django/pc/product-detail/detail.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Product Detail Gateway
 * ============================================================================
 */

import type { ProductDetailRuntimeContract } from './contracts'
import { buildEndpoint } from '../utils/buildEndpoint'
import { safeFetch } from '../utils/safeFetch'
import { normalizeProductDetail } from './normalize'

const PRODUCT_DETAIL_ENDPOINT = '/pc/products'

export async function fetchProductDetail(
    uniqueId: string,
): Promise<ProductDetailRuntimeContract> {

    const encodedUniqueId =
        encodeURIComponent(uniqueId)

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔥 PRODUCT DETAIL INPUT')
    console.log({
        raw: uniqueId,
        decoded: decodeURIComponent(uniqueId),
        reEncoded: encodeURIComponent(decodeURIComponent(uniqueId)),
        encodedUniqueId,
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const endpoint =
        buildEndpoint(
            `${PRODUCT_DETAIL_ENDPOINT}/${encodedUniqueId}/`
        )

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔥 FETCH PRODUCT DETAIL')
    console.log({
        uniqueId,
        encodedUniqueId,
        endpoint,
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const payload =
        await safeFetch<ProductDetailRuntimeContract>(
            endpoint
        )

    console.log(
        '🔥 PRODUCT DETAIL RAW',
        payload
    )

    if (!payload) {

        console.warn(
            '⚠️ PRODUCT DETAIL EMPTY'
        )

        return normalizeProductDetail()

    }

    const runtime =
        normalizeProductDetail(
            payload
        )

    console.log(
        '🔥 PRODUCT DETAIL CONTRACT',
        {
            found: runtime.data.found,
            unique_id: runtime.data.product.unique_id,
            name: runtime.data.product.name,
            semantic_schema_version: runtime.semantic_schema_version,
            authority_version: runtime.authority_version,
            semantic_authority: runtime.semantic_authority,
            ready: runtime.ready,
        }
    )

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return runtime

}

export const fetchProduct =
    fetchProductDetail

export default fetchProductDetail