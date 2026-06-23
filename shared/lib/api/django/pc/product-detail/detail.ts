// ============================================================================
// FILE:
// /shared/lib/api/django/pc/product-detail/detail.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

import {

  buildEndpoint,

} from '../utils/buildEndpoint'

import {

  safeFetch,

} from '../utils/safeFetch'

import type {

  ProductDetailRuntime,

} from './contracts'

import {

  normalizeProductDetailRuntime,

} from './normalize'

const PRODUCT_DETAIL_ENDPOINT =

  '/pc/products'

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

  /* ==========================================================================
  Raw Reality Capture
  ========================================================================== */

  console.log(
    '🔥 PRODUCT DETAIL RAW PAYLOAD',
    JSON.stringify(
      payload,
      null,
      2
    )
  )

  console.log(
    '🔥 PRODUCT DETAIL RAW SUMMARY',
    {

      unique_id:

        payload?.data?.product
          ?.unique_id,

      name:

        payload?.data?.product
          ?.name,

      semantic_authority:

        payload?.semantic_authority,

      authority_version:

        payload?.authority_version,

      ready:

        payload?.ready,

      has_compiled_runtime:

        !!payload?.data
          ?.compiled_runtime,

      has_product_semantic_runtime:

        !!payload?.data
          ?.product_semantic_runtime,

    }
  )

  /* ==========================================================================
  Normalize
  ========================================================================== */

  const runtime =

    normalizeProductDetailRuntime(
      payload
    )

  /* ==========================================================================
  Runtime Reality Capture
  ========================================================================== */

  console.log(
    '🔥 PRODUCT DETAIL RUNTIME',
    {

      product:

        runtime?.product
          ?.unique_id,

      semantic_summary:

        !!runtime
          ?.product_semantic_runtime
          ?.semantic_summary,

      semantic_reasons:

        runtime
          ?.product_semantic_runtime
          ?.semantic_reasons
          ?.length,

      workflow_tags:

        runtime
          ?.product_semantic_runtime
          ?.workflow_tags
          ?.length,

      related_intents:

        runtime
          ?.product_semantic_runtime
          ?.related_intents
          ?.length,

      grouped_attributes:

        Object.keys(

          runtime
            ?.product_semantic_runtime
            ?.grouped_attributes

          || {}

        ).length,

      semantic_labels:

        runtime
          ?.compiled_runtime
          ?.semantic_labels
          ?.length,

      runtime_profiles:

        runtime
          ?.compiled_runtime
          ?.runtime_profiles
          ?.length,

    }
  )

  return runtime

}

export default fetchProductDetail