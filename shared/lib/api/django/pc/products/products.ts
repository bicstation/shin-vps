// ============================================================================
// FILE:
// /shared/lib/api/django/pc/products/products.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Products Gateway
 * ============================================================================
 *
 * PURPOSE
 *
 * Transport the Backend Products Runtime into the
 * Canonical Products Contract.
 *
 * Backend Products Runtime
 *      ↓
 * Transport
 *      ↓
 * Normalize
 *      ↓
 * Products Contract
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

    ProductsRuntimeContract,

} from './contracts'

import {

    buildEndpoint,

} from '../utils/buildEndpoint'

import {

    safeFetch,

} from '../utils/safeFetch'

import {

    normalizeProducts,

} from './normalize'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const PRODUCTS_ENDPOINT =

    '/pc/products/'

/* ============================================================================
🔥 Fetch Products Runtime
============================================================================ */

export async function fetchProducts(

): Promise<ProductsRuntimeContract> {

    /* ------------------------------------------------------------------------
    Endpoint
    ------------------------------------------------------------------------ */

    const endpoint =

        buildEndpoint(

            PRODUCTS_ENDPOINT

        )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '🔥 FETCH PRODUCTS'
    )

    console.log({

        endpoint,

    })

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ------------------------------------------------------------------------
    Transport
    ------------------------------------------------------------------------ */

    const payload =

        await safeFetch<ProductsRuntimeContract>(

            endpoint

        )

    /* ------------------------------------------------------------------------
    Raw Runtime
    ------------------------------------------------------------------------ */

    console.log(

        '🔥 PRODUCTS RAW',

        payload

    )

    /* ------------------------------------------------------------------------
    Empty Runtime
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
    Observatory
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

            sample:

                products.data.products.at(0) ?? null,

        }

    )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ------------------------------------------------------------------------
    Return
    ------------------------------------------------------------------------ */

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