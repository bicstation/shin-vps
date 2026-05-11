// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/products/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Contracts
========================================= */

import type {

  PCProductItem,

} from './contracts'

/* =========================================
🔥 Normalize Products
========================================= */

export function
normalizeProducts(

  payload?: any

): PCProductItem[] {

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
    ): PCProductItem => ({

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