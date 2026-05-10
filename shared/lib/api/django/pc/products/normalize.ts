// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/products/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Normalize Products
========================================= */

export function
normalizeProducts(

  payload?: any
) {

  // ======================================
  // Safe Results
  // ======================================

  const results =

    Array.isArray(
      payload?.results
    )

      ? payload.results

      : Array.isArray(
          payload
        )

          ? payload

          : []

  // ======================================
  // Normalize
  // ======================================

  return results.map(item => ({

    // ====================================
    // Base
    // ====================================

    id:
      item?.id,

    unique_id:
      item?.unique_id || '',

    name:
      item?.name || '',

    maker:
      item?.maker || '',

    description:
      item?.description || '',

    // ====================================
    // URL
    // ====================================

    url:
      item?.url || '',

    affiliate_url:
      item?.affiliate_url || '',

    image_url:
      item?.image_url || '',

    // ====================================
    // Price
    // ====================================

    price:
      item?.price || 0,

    // ====================================
    // Score
    // ====================================

    spec_score:
      item?.spec_score || 0,

    score_cpu:
      item?.score_cpu || 0,

    score_gpu:
      item?.score_gpu || 0,

    score_ai:
      item?.score_ai || 0,

    score_cost:
      item?.score_cost || 0,

    score_portable:
      item?.score_portable || 0,

    // ====================================
    // Semantic
    // ====================================

    attributes:

      Array.isArray(
        item?.attributes
      )

        ? item.attributes

        : [],

    grouped_attributes:
      item?.grouped_attributes
      || {},

    semantic_schema_version:

      item?.semantic_schema_version
      || 1,
  }))
}