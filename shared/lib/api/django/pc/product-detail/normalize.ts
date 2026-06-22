// ============================================================================
// FILE:
// /shared/lib/api/django/pc/product-detail/normalize.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  ProductDetailRuntime,

  ProductSemanticRuntime,

} from './contracts'

/* ============================================================================
🔥 Normalize Product Detail Runtime
============================================================================ */

export function normalizeProductDetailRuntime(

  payload?: any

): ProductDetailRuntime {

  const source =

    payload?.data

    ??

    {}

  const semanticRuntime: ProductSemanticRuntime = {

    semantic_summary:

      source?.product_semantic_runtime
        ?.semantic_summary

      ||

      '',

    semantic_reasons:

      Array.isArray(

        source?.product_semantic_runtime
          ?.semantic_reasons

      )

        ? source.product_semantic_runtime
            .semantic_reasons

        : [],

    workflow_tags:

      Array.isArray(

        source?.product_semantic_runtime
          ?.workflow_tags

      )

        ? source.product_semantic_runtime
            .workflow_tags

        : [],

    grouped_attributes:

      source?.product_semantic_runtime
        ?.grouped_attributes

      ||

      {},

    related_intents:

      Array.isArray(

        source?.product_semantic_runtime
          ?.related_intents

      )

        ? source.product_semantic_runtime
            .related_intents

        : [],
  }

  console.log(
    '🔥 PRODUCT DETAIL NORMALIZE',
    {

      product:

        source?.product?.unique_id,

      semantic_summary:

        !!semanticRuntime
          .semantic_summary,

      semantic_reasons:

        semanticRuntime
          .semantic_reasons.length,

      workflow_tags:

        semanticRuntime
          .workflow_tags.length,

      related_intents:

        semanticRuntime
          .related_intents.length,
    }
  )

  return {

    /* ====================================
    Meaning Layer
    ==================================== */

    meaning:

      payload?.meaning

      ||

      {},

    seo:

      payload?.seo

      ||

      {},

    /* ====================================
    Product Reality
    ==================================== */

    product:

      source?.product

      ||

      {},

    /* ====================================
    Runtime Layer
    ==================================== */

    compiled_runtime:

      source?.compiled_runtime

      ||

      {},

    product_semantic_runtime:

      semanticRuntime,

    /* ====================================
    Raw Backup
    ==================================== */

    raw:

      payload,
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeProductDetailRuntime