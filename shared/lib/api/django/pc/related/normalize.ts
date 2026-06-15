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
export function normalizeRelated(

  payload?: any

): RelatedProduct[] {

  console.log(
    '🔥 RELATED RAW PAYLOAD',
    payload
  )

  const source =

    payload?.data
    ?? payload
    ?? {}

  const results =

    Array.isArray(
      source?.related_products
    )

      ? source.related_products

    : Array.isArray(
        source?.products
      )

      ? source.products

    : Array.isArray(
        source?.results
      )

      ? source.results

    : Array.isArray(
        source
      )

      ? source

    : []

  // ======================================
  // Normalize
  // ======================================
  console.log(
      '🔥 RELATED ITEM SAMPLE',
      results[0]
  )

  console.log(
    '🔥 RELATED RAW ITEM',
    JSON.stringify(
      results?.[0],
      null,
      2
    )
)


  const normalized =
  results.map(
    (
      item
    ): RelatedProduct => {

      const product =
        item?.product
        ?? item

      return {

        /* ====================================
        Identity
        ==================================== */

        id:
          product?.id,

        unique_id:
          product?.unique_id || '',

        /* ====================================
        Basic
        ==================================== */

        name:
          product?.name || '',

        maker:
          product?.maker || '',

        description:
          product?.description || '',

        /* ====================================
        URL
        ==================================== */

        url:
          product?.url || '',

        affiliate_url:
          product?.affiliate_url || '',

        image_url:
          product?.image_url || '',

        /* ====================================
        Price
        ==================================== */

        price:
          product?.price || 0,

        /* ====================================
        Specs
        ==================================== */

        cpu_model:
          product?.cpu_model || '',

        gpu_model:
          product?.gpu_model || '',

        memory_gb:
          product?.memory_gb || 0,

        storage_gb:
          product?.storage_gb || 0,

        /* ====================================
        Scores
        ==================================== */

        spec_score:
          product?.spec_score || 0,

        similarity_score:
          item?.score || 0,

        semantic_score:
          product?.semantic_score || 0,

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

        matched_attributes: [],

        attributes: [],

        grouped_attributes:
          product?.grouped_attributes
          || {},

        semantic_schema_version:
          product?.semantic_schema_version
          || 1,

        raw:
          item,
      }
    }
  )


  console.log(
    '🔥 RELATED NORMALIZED',
    normalized?.[0]
  )

  return normalized


}


