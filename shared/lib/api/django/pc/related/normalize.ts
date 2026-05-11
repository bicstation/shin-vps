// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/related/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Contracts
========================================= */

import type {

  RelatedProduct,

} from './contracts'

/* =========================================
🔥 Normalize Related
========================================= */

export function
normalizeRelated(

  payload?: any

): RelatedProduct[] {

  // ======================================
  // Safe Products
  // ======================================

  const results =

    Array.isArray(
      payload?.products
    )

      ? payload.products

      : Array.isArray(
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

  return results.map(
    (
      item
    ): RelatedProduct => ({

      /* ====================================
      Identity
      ==================================== */

      id:
        item?.id,

      unique_id:
        item?.unique_id || '',

      /* ====================================
      Basic
      ==================================== */

      name:
        item?.name || '',

      maker:
        item?.maker || '',

      description:
        item?.description || '',

      /* ====================================
      URL
      ==================================== */

      url:
        item?.url || '',

      affiliate_url:
        item?.affiliate_url || '',

      image_url:
        item?.image_url || '',

      /* ====================================
      Price
      ==================================== */

      price:
        item?.price || 0,

      /* ====================================
      Specs
      ==================================== */

      cpu_model:
        item?.cpu_model || '',

      gpu_model:
        item?.gpu_model || '',

      memory_gb:
        item?.memory_gb || 0,

      storage_gb:
        item?.storage_gb || 0,

      /* ====================================
      Scores
      ==================================== */

      spec_score:
        item?.spec_score || 0,

      similarity_score:
        item?.similarity_score || 0,

      semantic_score:
        item?.semantic_score || 0,

      /* ====================================
      Semantic
      ==================================== */

      semantic_role:
        item?.semantic_role || 'primary',

      semantic_weight:
        item?.semantic_weight || 0,

      recommendation_reason:
        item?.recommendation_reason || '',

      confidence:
        item?.confidence || 0,

      icon:
        item?.icon || '',

      color:
        item?.color || '',

      /* ====================================
      Related Semantic
      ==================================== */

      matched_attributes:

        Array.isArray(
          item?.matched_attributes
        )

          ? item.matched_attributes

          : [],

      /* ====================================
      Attributes
      ==================================== */

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

      /* ====================================
      Raw Backup
      ==================================== */

      raw:
        item,
    })
  )
}