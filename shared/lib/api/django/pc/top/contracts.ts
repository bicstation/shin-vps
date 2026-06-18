// ============================================================================
// FILE:
// /home/maya/shin-vps/shared/lib/api/django/pc/top/contracts.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Top Runtime Contracts
 * ============================================================================
 *
 * IMPORTANT
 *
 * Backend remains:
 *
 * semantic authority
 *
 * This contract represents:
 *
 * Runtime Reality
 *
 * NOT:
 *
 * UI Projection
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Meaning
============================================================================ */

export interface TopMeaning {

  identity: string

  mission: string

  user_intent: string

  meaning_statement: string

  existence_reason: string
}

/* ============================================================================
🔥 SEO
============================================================================ */

export interface TopSEO {

  title?: string

  description?: string

  keywords?: string[]

  canonical?: string

  schema_jsonld?: Record<string, any>
}

/* ============================================================================
🔥 Stats
============================================================================ */

export interface TopStats {

  product_count: number

  group_count: number

  attribute_count: number
}

/* ============================================================================
🔥 Featured Group
============================================================================ */

export interface TopFeaturedGroup {

  group_slug: string

  group_name: string

  parent_group?: string

  type?: string

  icon?: string

  color?: string

  sort_order?: string

  is_active?: string

  product_count?: number
}

/* ============================================================================
🔥 Featured Product
============================================================================ */

export interface TopFeaturedProduct {

  product_id?: number

  unique_id: string

  name: string

  maker?: string

  price?: number

  image_url?: string

  semantic_attributes?: string[]

  matched_groups?: string[]

  workflow_tags?: string[]

  semantic_labels?: string[]
}

/* ============================================================================
🔥 Runtime
============================================================================ */

export interface TopRuntime {

  meaning: TopMeaning

  seo: TopSEO

  stats: TopStats

  featured_groups: TopFeaturedGroup[]

  featured_products: TopFeaturedProduct[]

  semantic_schema_version?: number

  authority_version?: string

  semantic_authority?: string

  ready?: boolean

  raw?: any
}