// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/detail/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Contracts
========================================= */

import type {

  PCProduct,

} from './contracts'

/* =========================================
🔥 Normalize Detail
========================================= */

export function
normalizeDetail(

  payload?: any

): PCProduct | null {

  // ======================================
  // Empty Guard
  // ======================================

  if (!payload) {

    return null

  }

  // ======================================
  // Product Reality
  // ======================================

  const product =

    payload?.data?.product

    ?? payload?.product

    ?? payload?.data

    ?? payload

    ?? {}

  // ======================================
  // Normalize
  // ======================================

  return {

    // ====================================
    // Raw Product Reality
    // ====================================

    ...product,

    // ====================================
    // Identity Safety
    // ====================================

    id:
      product?.id,

    unique_id:
      product?.unique_id || '',

    // ====================================
    // Basic Safety
    // ====================================

    name:
      product?.name || '',

    product_type:
      product?.product_type || '',

    maker:
      product?.maker || '',

    brand:
      product?.brand || '',

    // ====================================
    // URL Safety
    // ====================================

    url:
      product?.url || '',

    image_url:
      product?.image_url || '',

    // ====================================
    // Price
    // ====================================

    price:
      product?.price || 0,

    // ====================================
    // Runtime Safety
    // ====================================

    semantic_runtime:

      product?.semantic_runtime

      || {},

    adaptive_runtime:

      product?.adaptive_runtime

      || {},

    semantic_related:

      Array.isArray(
        product?.semantic_related
      )

        ? product.semantic_related

        : [],

    semantic_labels:

      Array.isArray(
        product?.semantic_labels
      )

        ? product.semantic_labels

        : [],

    render_hints:

      product?.render_hints

      || {},

    // ====================================
    // AI Safety
    // ====================================

    ai_summary:
      product?.ai_summary || '',

    ai_content:
      product?.ai_content || '',

    // ====================================
    // Schema
    // ====================================

    semantic_schema_version:

      payload?.semantic_schema_version

      || 1,

    // ====================================
    // Meaning / SEO
    // ====================================

    meaning:

      payload?.meaning

      || {},

    seo:

      payload?.seo

      || {},

    // ====================================
    // Raw Backup
    // ====================================

    raw:
      payload,
  }
}

/* =========================================
🔥 Default Export
========================================= */

export default normalizeDetail