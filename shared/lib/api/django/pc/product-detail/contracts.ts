// ============================================================================
// FILE:
// /shared/lib/api/django/pc/product-detail/contracts.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/* ============================================================================
🔥 Product Meaning
============================================================================ */

export interface ProductMeaning {

  identity?: string

  mission?: string

  user_intent?: string

  meaning_statement?: string

  existence_reason?: string
}

/* ============================================================================
🔥 Product SEO
============================================================================ */

export interface ProductSEO {

  title?: string

  description?: string

  keywords?: string[]

  canonical?: string

  schema_jsonld?: any
}

/* ============================================================================
🔥 Product Reality
============================================================================ */

export interface ProductReality {

  /* ========================================================================
  Identity
  ======================================================================== */

  id?: number

  unique_id: string

  site_prefix?: string

  /* ========================================================================
  Basic
  ======================================================================== */

  name: string

  maker?: string

  description?: string

  /* ========================================================================
  Media
  ======================================================================== */

  image_url?: string

  /* ========================================================================
  URLs
  ======================================================================== */

  url?: string

  affiliate_url?: string

  /* ========================================================================
  Pricing
  ======================================================================== */

  price?: number

  /* ========================================================================
  Product Status
  ======================================================================== */

  stock_status?: string

  is_active?: boolean

  is_posted?: boolean

  /* ========================================================================
  Hardware
  ======================================================================== */

  cpu_model?: string

  gpu_model?: string

  memory_gb?: number

  storage_gb?: number

  weight_kg?: number | null

  /* ========================================================================
  Semantic Product Fields
  ======================================================================== */

  semantic_schema_version?: string

  product_type?: string

  semantic_score?: number

  ai_summary?: string | null

  target_user?: string | null

  strengths?: string[]

  weaknesses?: string[]

  usage_tags?: string[]

  /* ========================================================================
  Timestamps
  ======================================================================== */

  created_at?: string

  updated_at?: string
}

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

// export interface ProductSemanticRuntime {

//   semantic_summary: string

//   semantic_reasons: string[]

//   workflow_tags: string[]

//   grouped_attributes:
//     // Record<string, any>
//     Record<string, string[]>

//   related_intents:
//     RelatedIntent[]
// }

export interface ProductSemanticRuntime {

  semantic_summary: string

  semantic_reasons: string[]

  workflow_tags: string[]

  grouped_attributes:
    Record<string, string[]>

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

  meaning?: ProductMeaning

  seo?: ProductSEO

  product: ProductReality

  compiled_runtime?:
    CompiledRuntime

  product_semantic_runtime:
    ProductSemanticRuntime

  semantic_schema_version?:
    string

  authority_version?:
    string

  semantic_authority?:
    string

  ready?:
    boolean

  raw?:
    any
}



// export interface ProductDetailRuntime {

//   /* ========================================================================
//   Meaning Layer
//   ======================================================================== */

//   meaning?: ProductMeaning

//   seo?: ProductSEO

//   /* ========================================================================
//   Product Reality
//   ======================================================================== */

//   product: ProductReality

//   /* ========================================================================
//   Compiled Runtime
//   ======================================================================== */

//   compiled_runtime?:
//     CompiledRuntime

//   /* ========================================================================
//   Semantic Runtime V2
//   ======================================================================== */

//   product_semantic_runtime:
//     ProductSemanticRuntime

//   /* ========================================================================
//   Runtime Metadata
//   ======================================================================== */

//   semantic_schema_version?: string

//   authority_version?: string

//   semantic_authority?: string

//   ready?: boolean

//   /* ========================================================================
//   Raw Backup
//   ======================================================================== */

//   raw?: any
// }