// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/related/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Normalize Related
========================================= */

export function
normalizeRelated(

  payload?: any
) {

  // ======================================
  // Safe Array
  // ======================================

  const results =

    Array.isArray(payload)

      ? payload

      : Array.isArray(
          payload?.results
        )

          ? payload.results

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

    similarity_score:
      item?.similarity_score || 0,

    // ====================================
    // Semantic
    // ====================================

    matched_attributes:

      Array.isArray(
        item?.matched_attributes
      )

        ? item.matched_attributes

        : [],

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