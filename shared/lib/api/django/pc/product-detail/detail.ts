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
 *
 * PURPOSE
 *
 * Transport the Backend Product Detail Runtime into the
 * Canonical Product Detail Contract.
 *
 * Backend Product Detail Runtime
 *      ↓
 * Transport
 *      ↓
 * Normalize
 *      ↓
 * Product Detail Contract
 *
 * Backend remains:
 *
 * Reality Authority
 *
 * Gateway Responsibilities
 *
 * ✓ Resolve Endpoint
 * ✓ Transport Runtime
 * ✓ Invoke Normalize
 * ✓ Observe Runtime
 *
 * Gateway SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Runtime
 * ✗ Generate Projection
 * ✗ Generate UI
 *
 * ============================================================================
 */

import type {

    ProductDetailRuntimeContract,

} from './contracts'

import {

    buildEndpoint,

} from '../utils/buildEndpoint'

import {

    safeFetch,

} from '../utils/safeFetch'

import {

    normalizeProductDetail,

} from './normalize'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const PRODUCT_DETAIL_ENDPOINT =

    '/pc/products'

/* ============================================================================
🔥 Fetch Product Detail Runtime
============================================================================ */

export async function fetchProductDetail(

    uniqueId: string,

): Promise<ProductDetailRuntimeContract> {

    /* ------------------------------------------------------------------------
    Endpoint
    ------------------------------------------------------------------------ */

    const endpoint =

        buildEndpoint(

            `${PRODUCT_DETAIL_ENDPOINT}/${encodeURIComponent(uniqueId)}/`

        )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '🔥 FETCH PRODUCT DETAIL'
    )

    console.log({

        uniqueId,

        endpoint,

    })

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ------------------------------------------------------------------------
    Transport
    ------------------------------------------------------------------------ */

    const payload =

        await safeFetch<ProductDetailRuntimeContract>(

            endpoint

        )

    /* ------------------------------------------------------------------------
    Raw Runtime
    ------------------------------------------------------------------------ */

    console.log(

        '🔥 PRODUCT DETAIL RAW',

        payload

    )

    /* ------------------------------------------------------------------------
    Empty Runtime
    ------------------------------------------------------------------------ */

    if (!payload) {

        console.warn(

            '⚠️ PRODUCT DETAIL EMPTY'

        )

        return normalizeProductDetail()

    }

    /* ------------------------------------------------------------------------
    Normalize
    ------------------------------------------------------------------------ */

    const runtime =

        normalizeProductDetail(

            payload

        )

    /* ------------------------------------------------------------------------
    Observatory
    ------------------------------------------------------------------------ */

    console.log(

        '🔥 PRODUCT DETAIL CONTRACT',

        {

            found:

                runtime.data.found,

            unique_id:

                runtime.data.product.unique_id,

            name:

                runtime.data.product.name,

            semantic_schema_version:

                runtime.semantic_schema_version,

            authority_version:

                runtime.authority_version,

            semantic_authority:

                runtime.semantic_authority,

            ready:

                runtime.ready,

        }

    )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ------------------------------------------------------------------------
    Return
    ------------------------------------------------------------------------ */

    return runtime

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchProduct =

    fetchProductDetail

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchProductDetail