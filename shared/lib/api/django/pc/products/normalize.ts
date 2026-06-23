// ============================================================================
// FILE:
// /shared/lib/api/django/pc/products/normalize.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  ProductsRuntime,

  PCProductItem,

} from './contracts'

/* ============================================================================
🔥 Normalize Products Runtime
============================================================================ */

export function normalizeProductsRuntime(

  payload?: any

): ProductsRuntime {

  const source =

    payload?.data

    ??

    {}

  /* ========================================================================
  Products
  ======================================================================== */

  const products: PCProductItem[] =

    Array.isArray(
      source?.products
    )

      ? source.products.map(
          (
            item: any
          ): PCProductItem => ({

            /* ====================================
            Identity
            ==================================== */

            id:
              item?.id,

            unique_id:
              item?.unique_id || '',

            site_prefix:
              item?.site_prefix,

            /* ====================================
            Basic
            ==================================== */

            name:
              item?.name || '',

            maker:
              item?.maker,

            description:
              item?.description,

            /* ====================================
            Media
            ==================================== */

            image_url:
              item?.image_url,

            /* ====================================
            URLs
            ==================================== */

            url:
              item?.url,

            affiliate_url:
              item?.affiliate_url,

            /* ====================================
            Pricing
            ==================================== */

            price:
              item?.price,

            /* ====================================
            Hardware
            ==================================== */

            cpu_model:
              item?.cpu_model,

            gpu_model:
              item?.gpu_model,

            memory_gb:
              item?.memory_gb,

            storage_gb:
              item?.storage_gb,

            /* ====================================
            Semantic
            ==================================== */

            semantic_score:
              item?.semantic_score,

            semantic_role:
              item?.semantic_role,

            semantic_weight:
              item?.semantic_weight,

            recommendation_reason:
              item?.recommendation_reason,

            confidence:
              item?.confidence,

            /* ====================================
            Discovery
            ==================================== */

            grouped_attributes:

              item?.grouped_attributes

              ||

              {},

            semantic_schema_version:

              item?.semantic_schema_version,

            /* ====================================
            Metadata
            ==================================== */

            created_at:
              item?.created_at,

            updated_at:
              item?.updated_at,

            /* ====================================
            Raw Backup
            ==================================== */

            raw:
              item,
          })
        )

      : []

  console.log(
    '🔥 PRODUCTS NORMALIZE',
    {

      count:
        products.length,

      inventory_count:
        source?.count,

      page:
        source?.page,

      has_next:
        source?.has_next,
    }
  )

  /* ========================================================================
  Runtime
  ======================================================================== */

  return {

    meaning:

      payload?.meaning

      ||

      {},

    seo:

      payload?.seo

      ||

      {},

    inventory: {

      count:
        source?.count || 0,

      page:
        source?.page || 1,

      page_size:
        source?.page_size || 0,

      has_next:
        !!source?.has_next,
    },

    products,

    semantic_schema_version:

      payload?.semantic_schema_version,

    authority_version:

      payload?.authority_version,

    semantic_authority:

      payload?.semantic_authority,

    ready:

      payload?.ready,

    raw:

      payload,
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeProductsRuntime