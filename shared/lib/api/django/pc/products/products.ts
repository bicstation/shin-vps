// ============================================================================
// FILE:
// /shared/lib/api/django/pc/products/products.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Reality Inventory Runtime Gateway
 * ============================================================================
 *
 * PURPOSE
 *
 * GET /api/pc/products/
 *
 * ↓
 *
 * Reality Inventory Runtime
 *
 * IMPORTANT
 *
 * This layer MUST NOT:
 *
 * ❌ generate meaning
 * ❌ generate seo
 * ❌ generate inventory
 * ❌ generate products
 * ❌ mutate backend authority
 *
 * RESPONSIBILITY
 *
 * Transport
 * ↓
 * Normalize
 * ↓
 * Runtime
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Utils
============================================================================ */

import {

  buildEndpoint,

} from '../utils/buildEndpoint'

import {

  safeFetch,

} from '../utils/safeFetch'

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  ProductsRuntime,

} from './contracts'

/* ============================================================================
🔥 Normalize
============================================================================ */

import {

  normalizeProductsRuntime,

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

): Promise<ProductsRuntime> {

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 FETCH PRODUCTS RUNTIME'
  )

  const endpoint =

    buildEndpoint(
      PRODUCTS_ENDPOINT
    )

  console.log(
    '🔥 PRODUCTS ENDPOINT',
    endpoint
  )

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  const payload =

    await safeFetch(
      endpoint
    )

  console.log(
    '🔥 PRODUCTS RAW PAYLOAD',
    {

      count:
        payload?.data?.count,

      page:
        payload?.data?.page,

      page_size:
        payload?.data?.page_size,

      has_next:
        payload?.data?.has_next,

      products:
        payload?.data?.products?.length,
    }
  )

  const runtime =

    normalizeProductsRuntime(
      payload
    )

  console.log(
    '🔥 PRODUCTS RUNTIME',
    {

      inventory_count:
        runtime?.inventory?.count,

      page:
        runtime?.inventory?.page,

      page_size:
        runtime?.inventory?.page_size,

      has_next:
        runtime?.inventory?.has_next,

      products:
        runtime?.products?.length,

      authority:
        runtime?.semantic_authority,
    }
  )

  return runtime
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchProducts