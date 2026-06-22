// ============================================================================
// FILE:
// /shared/lib/api/django/pc/product-detail/detail.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Product Detail Runtime Gateway
 * ============================================================================
 *
 * PURPOSE
 *
 * GET /api/pc/products/{unique_id}/
 *
 * ↓
 *
 * Product Detail Runtime
 *
 * IMPORTANT
 *
 * This layer MUST NOT:
 *
 * ❌ generate meaning
 * ❌ generate semantic_summary
 * ❌ generate workflow_tags
 * ❌ generate related_intents
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

  ProductDetailRuntime,

} from './contracts'

/* ============================================================================
🔥 Normalize
============================================================================ */

import {

  normalizeProductDetailRuntime,

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

  uniqueId: string

): Promise<ProductDetailRuntime> {

  if (!uniqueId) {

    console.warn(
      '⚠️ PRODUCT DETAIL EMPTY ID'
    )

    return normalizeProductDetailRuntime()
  }

  const endpoint =

    buildEndpoint(
      `${PRODUCT_DETAIL_ENDPOINT}/${uniqueId}/`
    )

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 PRODUCT DETAIL FETCH'
  )

  console.log({

    uniqueId,

    endpoint,

    runtime:
      'product-detail-runtime',
  })

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  const payload =

    await safeFetch(
      endpoint
    )

  console.log(
    '🔥 PRODUCT DETAIL RAW',
    payload
  )

  return normalizeProductDetailRuntime(
    payload
  )
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchProductDetail