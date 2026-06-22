// ============================================================================
// FILE:
// /shared/lib/api/django/pc/products/normalize.ts
// ============================================================================

import type {

  PCProductItem,

} from './contracts'

/* ============================================================================
🔥 Normalize Products
============================================================================ */

export function normalizeProducts(

  payload?: any

): PCProductItem[] {

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

  return results.map(
    (
      item
    ): PCProductItem => ({

      /* ====================================================================
      Identity
      ==================================================================== */

      id:
        item?.id,

      unique_id:
        item?.unique_id || '',

      /* ====================================================================
      Basic
      ==================================================================== */

      name:
        item?.name || '',

      maker:
        item?.maker || '',

      description:
        item?.description || '',

      /* ====================================================================
      URLs
      ==================================================================== */

      url:
        item?.url || '',

      affiliate_url:
        item?.affiliate_url || '',

      image_url:
        item?.image_url || '',

      /* ====================================================================
      Price
      ==================================================================== */

      price:
        Number(
          item?.price
        ) || 0,

      /* ====================================================================
      Specs
      ==================================================================== */

      cpu_model:
        item?.cpu_model || '',

      gpu_model:
        item?.gpu_model || '',

      memory_gb:
        Number(
          item?.memory_gb
        ) || 0,

      storage_gb:
        Number(
          item?.storage_gb
        ) || 0,

      /* ====================================================================
      Scores
      ==================================================================== */

      spec_score:
        Number(
          item?.spec_score
        ) || 0,

      score_cpu:
        Number(
          item?.score_cpu
        ) || 0,

      score_gpu:
        Number(
          item?.score_gpu
        ) || 0,

      score_ai:
        Number(
          item?.score_ai
        ) || 0,

      score_cost:
        Number(
          item?.score_cost
        ) || 0,

      score_portable:
        Number(
          item?.score_portable
        ) || 0,

      semantic_score:
        Number(
          item?.semantic_score
        ) || 0,

      /* ====================================================================
      Collection Semantics
      ==================================================================== */

      semantic_role:
        item?.semantic_role || 'primary',

      semantic_weight:
        Number(
          item?.semantic_weight
        ) || 0,

      recommendation_reason:
        item?.recommendation_reason || '',

      confidence:
        Number(
          item?.confidence
        ) || 0,

      icon:
        item?.icon || '',

      color:
        item?.color || '',

      /* ====================================================================
      Discovery
      ==================================================================== */

      attributes:

        Array.isArray(
          item?.attributes
        )

          ? item.attributes

          : [],

      grouped_attributes:

        item?.grouped_attributes

        ||

        {},

      semantic_schema_version:

        Number(
          item?.semantic_schema_version
        )

        ||

        1,

      /* ====================================================================
      Raw Backup
      ==================================================================== */

      raw:
        item,
    })
  )
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeProducts