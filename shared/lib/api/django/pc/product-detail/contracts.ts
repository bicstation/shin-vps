// ============================================================================
// FILE:
// /shared/lib/api/django/pc/product-detail/contracts.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/* ============================================================================
🔥 Related Intent
============================================================================ */

export interface RelatedIntent {

  slug: string

  title: string

  description?: string | null
}

/* ============================================================================
🔥 Product Semantic Runtime
============================================================================ */

export interface ProductSemanticRuntime {

  semantic_summary: string

  semantic_reasons: string[]

  workflow_tags: string[]

  grouped_attributes:
    Record<string, any>

  related_intents:
    RelatedIntent[]
}

/* ============================================================================
🔥 Compiled Runtime
============================================================================ */

export interface CompiledRuntime {

  is_ai_pc?: boolean

  product_type?: string

  workflow_tags?: string[]

  target_segment?: string

  semantic_labels?: string[]

  runtime_profiles?: string[]

  [key: string]: any
}

/* ============================================================================
🔥 Product Detail Runtime
============================================================================ */

export interface ProductDetailRuntime {

  /* ========================================================================
  Meaning Layer
  ======================================================================== */

  meaning?: any

  seo?: any

  /* ========================================================================
  Product Reality
  ======================================================================== */

  product?: any

  /* ========================================================================
  Compiled Runtime
  ======================================================================== */

  compiled_runtime?:
    CompiledRuntime

  /* ========================================================================
  Semantic Runtime V2
  ======================================================================== */

  product_semantic_runtime:
    ProductSemanticRuntime

  /* ========================================================================
  Raw Backup
  ======================================================================== */

  raw?: any
}