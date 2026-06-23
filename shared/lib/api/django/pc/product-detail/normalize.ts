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

  ProductReality,

  CompiledRuntime,

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
  
  console.log(
    "🔥 NORMALIZE SOURCE",
    JSON.stringify(source, null, 2)
    )

  /* ==========================================================================
  Product Reality
  ========================================================================== */

  const product: ProductReality = {

    id:
      source?.product?.id,

    unique_id:
      source?.product?.unique_id || '',

    site_prefix:
      source?.product?.site_prefix,

    maker:
      source?.product?.maker,

    name:
      source?.product?.name || '',

    description:
      source?.product?.description,

    image_url:
      source?.product?.image_url,

    url:
      source?.product?.url,

    affiliate_url:
      source?.product?.affiliate_url,

    price:
      source?.product?.price,

    stock_status:
      source?.product?.stock_status,

    is_active:
      source?.product?.is_active,

    is_posted:
      source?.product?.is_posted,

    cpu_model:
      source?.product?.cpu_model,

    gpu_model:
      source?.product?.gpu_model,

    memory_gb:
      source?.product?.memory_gb,

    storage_gb:
      source?.product?.storage_gb,

    weight_kg:
      source?.product?.weight_kg,

    semantic_schema_version:
      source?.product?.semantic_schema_version,

    product_type:
      source?.product?.product_type,

    semantic_score:
      source?.product?.semantic_score,

    ai_summary:
      source?.product?.ai_summary,

    target_user:
      source?.product?.target_user,

    strengths:

      Array.isArray(
        source?.product?.strengths
      )

        ? source.product.strengths

        : [],

    weaknesses:

      Array.isArray(
        source?.product?.weaknesses
      )

        ? source.product.weaknesses

        : [],

    usage_tags:

      Array.isArray(
        source?.product?.usage_tags
      )

        ? source.product.usage_tags

        : [],

    created_at:
      source?.product?.created_at,

    updated_at:
      source?.product?.updated_at,
  }

  /* ==========================================================================
  Compiled Runtime
  ========================================================================== */

  const compiledRuntime: CompiledRuntime = {

    is_ai_pc:
      source?.compiled_runtime?.is_ai_pc,

    product_type:
      source?.compiled_runtime?.product_type,

    workflow_tags:

      Array.isArray(
        source?.compiled_runtime?.workflow_tags
      )

        ? source.compiled_runtime.workflow_tags

        : [],

    target_segment:
      source?.compiled_runtime?.target_segment,

    semantic_labels:

      Array.isArray(
        source?.compiled_runtime?.semantic_labels
      )

        ? source.compiled_runtime.semantic_labels

        : [],

    runtime_profiles:

      Array.isArray(
        source?.compiled_runtime?.runtime_profiles
      )

        ? source.compiled_runtime.runtime_profiles

        : [],
  }

  /* ==========================================================================
  Semantic Runtime
  ========================================================================== */

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
  "🔥 SEMANTIC RUNTIME CHECK",
  {
    semantic_runtime:
      source?.product?.semantic_runtime,

    product_semantic_runtime:
      source?.product_semantic_runtime,

    compiled_runtime:
      source?.compiled_runtime,
  }
)

  const runtime: ProductDetailRuntime = {

    meaning:
      payload?.meaning || {},

    seo:
      payload?.seo || {},

    product,

    compiled_runtime:
      compiledRuntime,

    product_semantic_runtime:
      semanticRuntime,

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

  console.log(
    "🔥 NORMALIZED OUTPUT",
    JSON.stringify(
      {
        product:
          runtime.product?.unique_id,

        semantic_summary:
          runtime.product_semantic_runtime
            ?.semantic_summary,

        semantic_reasons:
          runtime.product_semantic_runtime
            ?.semantic_reasons
            ?.length,

        workflow_tags:
          runtime.product_semantic_runtime
            ?.workflow_tags
            ?.length,

        related_intents:
          runtime.product_semantic_runtime
            ?.related_intents
            ?.length,

        grouped_attributes:
          Object.keys(
            runtime.product_semantic_runtime
              ?.grouped_attributes
              || {}
          ).length,

        semantic_labels:
          runtime.compiled_runtime
            ?.semantic_labels
            ?.length,

        runtime_profiles:
          runtime.compiled_runtime
            ?.runtime_profiles
            ?.length,

      },
      null,
      2
    )
  )

  return runtime

}