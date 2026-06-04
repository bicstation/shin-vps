// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/search/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Contracts
========================================= */

import type {

  SemanticSearchResponse,

  SemanticProduct,

} from './contracts'

/* =========================================
🔥 Normalize Semantic Search
========================================= */

export function
normalizeSemanticSearch(

  payload?: any

): SemanticSearchResponse<
  SemanticProduct
> {

  // ======================================
  // Safe Results
  // ======================================
  const rawResults =

    Array.isArray(
      payload?.results
    )

      ? payload.results

    : Array.isArray(
        payload?.products
      )

        ? payload.products

    : Array.isArray(
        payload?.items
      )

        ? payload.items

    : Array.isArray(
        payload?.hits
      )

        ? payload.hits

    : Array.isArray(
        payload
      )

        ? payload

        : []


  // ======================================
  // Normalize Results
  // ======================================

  const results:

    SemanticProduct[] =

      rawResults.map(
        (
          item: any
        ): SemanticProduct => ({

          /* ================================
          Identity
          ================================= */

          id:
            item?.id,

          unique_id:
            item?.unique_id || '',

          /* ================================
          Basic
          ================================= */

          name:
            item?.name || '',

          maker:
            item?.maker || '',

          price:
            item?.price || 0,

          image_url:
            item?.image_url || '',

          description:
            item?.description || '',

          url:
            item?.url || '',

          affiliate_url:
            item?.affiliate_url || '',

          /* ================================
          Specs
          ================================= */

          cpu_model:
            item?.cpu_model || '',

          gpu_model:
            item?.gpu_model || '',

          memory_gb:
            item?.memory_gb || 0,

          storage_gb:
            item?.storage_gb || 0,

          /* ================================
          Scores
          ================================= */

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

          /* ================================
          Semantic
          ================================= */

          semantic_role:
            item?.semantic_role
            || 'primary',

          semantic_weight:
            item?.semantic_weight
            || 0,

          recommendation_reason:
            item?.recommendation_reason
            || '',

          confidence:
            item?.confidence
            || 0,

          icon:
            item?.icon || '',

          color:
            item?.color || '',

          /* ================================
          Attributes
          ================================= */

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

          /* ================================
          Raw Backup
          ================================= */

          raw:
            item,
        })
      )

  // ======================================
  // Total
  // ======================================

  const total =

    typeof payload?.total ===
    'number'

      ? payload.total

      : results.length

  // ======================================
  // Semantic Schema Version
  // ======================================

  const semanticSchemaVersion =

    typeof
    payload?.semantic_schema_version
    === 'number'

      ? payload
          .semantic_schema_version

      : 1

  // ======================================
  // Success
  // ======================================

  const success =

    typeof payload?.success ===
    'boolean'

      ? payload.success

      : true

  // ======================================
  // Response
  // ======================================

  return {

    success,

    results,

    total,

    semantic_schema_version:
      semanticSchemaVersion,
  }
}