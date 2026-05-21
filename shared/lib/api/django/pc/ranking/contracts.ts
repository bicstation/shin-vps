// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/ranking/contracts.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Ranking Runtime Contracts
 *
 * IMPORTANT:
 *
 * Backend remains:
 *
 * semantic authority
 *
 * Frontend remains:
 *
 * rendering authority
 *
 * This contract layer exists for:
 *
 * - semantic collection preservation
 * - frontend-safe runtime exposure
 * - shallow-safe exploration continuity
 *
 * IMPORTANT:
 *
 * This layer MUST NOT:
 *
 * ❌ generate semantic meaning
 * ❌ infer workflow intent
 * ❌ recursively expand semantic graphs
 * ❌ mutate traversal runtime
 */

/* ============================================================================
🔥 Semantic Attribute
============================================================================ */

export type SemanticAttribute = {

  name?: string

  slug?: string

  icon?: string

  color?: string

  label?: string
}

/* ============================================================================
🔥 Semantic Runtime
============================================================================ */

export type SemanticRuntime = {

  workflows?: string[]

  workflow_tags?: string[]

  semantic_graph?: any[]

  semantic_score?: number

  semantic_role?: string
}

/* ============================================================================
🔥 Adaptive Runtime
============================================================================ */

export type AdaptiveRuntime = {

  product_type?: string

  render_hints?: Record<string, any>
}

/* ============================================================================
🔥 Ranking Product
============================================================================ */

/**
 * IMPORTANT:
 *
 * Ranking collections MUST remain:
 *
 * shallow-safe
 *
 * Recursive semantic expansion is prohibited.
 */
export type RankingProduct = {

  /* =====================================
  Identity
  ===================================== */

  id?: number

  unique_id?: string

  /* =====================================
  Basic
  ===================================== */

  name?: string

  maker?: string

  brand?: string

  product_type?: string

  price?: number

  image_url?: string

  url?: string

  /* =====================================
  Semantic
  ===================================== */

  semantic_score?: number

  semantic_role?: string

  recommendation_reason?: string

  confidence?: number

  semantic_labels?: string[]

  workflow_tags?: string[]

  grouped_attributes?: {

    usage?: SemanticAttribute[]

    gpu?: SemanticAttribute[]

    maker?: SemanticAttribute[]
  }

  /* =====================================
  Runtime
  ===================================== */

  semantic_runtime?: SemanticRuntime

  adaptive_runtime?: AdaptiveRuntime

  render_hints?: Record<string, any>
}

/* ============================================================================
🔥 Ranking Collection
============================================================================ */

export type RankingCollection = {

  results?: RankingProduct[]

  total?: number

  page?: number

  limit?: number
}

/* ============================================================================
🔥 SEO Runtime
============================================================================ */

export type RankingSEO = {

  title?: string

  description?: string

  canonical?: string

  keywords?: string[]

  openGraph?: any

  twitter?: any
}

/* ============================================================================
🔥 Ranking Runtime Response
============================================================================ */

/**
 * IMPORTANT:
 *
 * This response represents:
 *
 * semantic discovery runtime
 *
 * NOT:
 *
 * simple product listing
 */
export type SemanticRankingRuntime = {

  success?: boolean

  ranking?: RankingCollection

  semantic_runtime?: SemanticRuntime

  adaptive_runtime?: AdaptiveRuntime

  semantic_labels?: string[]

  workflow_tags?: string[]

  grouped_attributes?: Record<string, any>

  semantic_graph?: any[]

  render_hints?: Record<string, any>

  seo?: RankingSEO

  faq?: any[]

  breadcrumbs?: any[]

  schemas?: {

    itemSchema?: any

    breadcrumbSchema?: any

    faqSchema?: any

    collectionSchema?: any
  }

  ui?: any

  semantic_schema_version?: number

  raw?: any
}