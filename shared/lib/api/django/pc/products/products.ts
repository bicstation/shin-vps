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
🔥 Fetch Options
============================================================================ */

export interface FetchProductsOptions {

  page?: number

  pageSize?: number

}

/* ============================================================================
🔥 Fetch Products Runtime
============================================================================ */

export async function fetchProducts(

  options?: FetchProductsOptions

): Promise<ProductsRuntime> {

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 FETCH PRODUCTS RUNTIME'
  )

  /* ========================================================================
  Query
  ======================================================================== */

  const query =

    new URLSearchParams()

  if (

    options?.page !== undefined

  ) {

    query.set(

      'page',

      String(options.page)

    )

  }

  if (

    options?.pageSize !== undefined

  ) {

    query.set(

      'page_size',

      String(options.pageSize)

    )

  }

  /* ========================================================================
  Endpoint
  ======================================================================== */

  const endpoint =

    buildEndpoint(

      query.toString()

        ? `${PRODUCTS_ENDPOINT}?${query.toString()}`

        : PRODUCTS_ENDPOINT

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

      semantic_schema_version:
        payload?.semantic_schema_version,

      authority_version:
        payload?.authority_version,

      semantic_authority:
        payload?.semantic_authority,

      ready:
        payload?.ready,
    }
  )

  const runtime =

    normalizeProductsRuntime(
      payload
    )

  console.log(
    '🔥 PRODUCTS RUNTIME',
    {

      count:
        runtime?.count,

      page:
        runtime?.page,

      page_size:
        runtime?.page_size,

      has_next:
        runtime?.has_next,

      products:
        runtime?.products?.length,

      semantic_schema_version:
        runtime?.semantic_schema_version,

      authority_version:
        runtime?.authority_version,

      semantic_authority:
        runtime?.semantic_authority,

      ready:
        runtime?.ready,
    }
  )

  return runtime

}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchProducts