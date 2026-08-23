// ============================================================================
// FILE:
// /home/maya/shin-vps/shared/lib/api/django/pc/top/contracts.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Top Runtime Contracts
 * ============================================================================
 *
 * PURPOSE
 *
 * Defines the canonical TypeScript contract that represents the
 * Backend Top Runtime JSON.
 *
 * Backend remains:
 *
 * Semantic Authority
 * Reality Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * This contract mirrors Backend Runtime Reality.
 *
 * It does NOT:
 *
 * ✗ Generate Semantic Meaning
 * ✗ Generate SEO
 * ✗ Generate Presentation
 * ✗ Generate Statistics
 * ✗ Re-rank Featured Groups
 * ✗ Re-rank Featured Products
 * ✗ Generate UI Meaning
 * ✗ Define Frontend UI
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Top Meaning
============================================================================ */

export interface TopMeaning {

  identity: string

  mission: string

  user_intent: string

  meaning_statement: string

  existence_reason: string

}

/* ============================================================================
🔥 Top Presentation
============================================================================ */

export interface TopPresentation {

  title?: string

  subtitle?: string

  description?: string

}

/* ============================================================================
🔥 Top SEO
============================================================================ */

export interface TopSEO {

  title?: string

  description?: string

  keywords?: string[]

  canonical?: string

  schema_jsonld?: Record<string, any>

  open_graph?: Record<string, any>

  twitter?: Record<string, any>

}

/* ============================================================================
🔥 Top Stats
============================================================================ */

export interface TopStats {

  product_count: number

  group_count: number

  attribute_count: number

}

/* ============================================================================
🔥 Top Featured Group
============================================================================ */

export interface TopFeaturedGroup {

  group_slug: string

  group_name: string

  presentation_name?: string

  presentation_description?: string

  parent_group?: string

  type?: string

  icon?: string

  color?: string

  sort_order?: string

  discovery_priority?: string

  is_active?: string

  product_count?: number

}

/* ============================================================================
🔥 Top Featured Product
============================================================================ */

export interface TopFeaturedProduct {

  product_id?: number

  unique_id: string

  name: string

  maker?: string

  price?: number

  image_url?: string

  cpu_model?: string | null

  gpu_model?: string | null

  memory_gb?: number | null

  storage_gb?: number | null

  display_info?: string | null

  is_ai_pc?: boolean

  semantic_attributes?: string[]

  matched_groups?: string[]

  reality_scores?: Record<string, number>

  product_type?: string | null

  primary_workflow?: string | null

  workflow_score?: number

  semantic_score?: number

  workflow_tags?: string[]

  workflows?: any[]

  semantic_labels?: string[]

  adaptive_runtime?: Record<string, any>

  semantic_version?: string | null

  semantic_authority?: string | null

  runtime_valid?: boolean

}

/* ============================================================================
🔥 Top Data
============================================================================ */

export interface TopData {

  stats: TopStats

  featured_groups: TopFeaturedGroup[]

  featured_products: TopFeaturedProduct[]

}

/* ============================================================================
🔥 Top Runtime Contract
============================================================================ */

export interface TopRuntimeContract {

  /* ------------------------------------------------------------------------
  Backend Meaning
  ------------------------------------------------------------------------ */

  meaning: TopMeaning

  /* ------------------------------------------------------------------------
  Backend Presentation
  ------------------------------------------------------------------------ */

  presentation?: TopPresentation

  /* ------------------------------------------------------------------------
  Backend SEO
  ------------------------------------------------------------------------ */

  seo: TopSEO

  /* ------------------------------------------------------------------------
  Backend Data
  ------------------------------------------------------------------------ */

  data: TopData

  /* ------------------------------------------------------------------------
  Backend Authority
  ------------------------------------------------------------------------ */

  semantic_schema_version?: number

  authority_version?: string

  semantic_authority?: string

  ready?: boolean

  /* ------------------------------------------------------------------------
  Raw Backend Payload
  ------------------------------------------------------------------------ */

  raw?: any

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export type TopRuntime =

  TopRuntimeContract

export type TopRuntimeResponse =

  TopRuntimeContract