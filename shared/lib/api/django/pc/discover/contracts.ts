// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/contracts.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Discover Continuity Contracts
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * semantic exploration continuity
 *
 * NOT:
 *
 * semantic authority
 *
 * Responsibilities:
 *
 * - exploration continuity contracts
 * - discover topology stabilization
 * - runtime-safe discover structures
 * - frontend-safe exploration contracts
 *
 * IMPORTANT:
 *
 * Backend remains:
 *
 * semantic authority
 *
 * Discover remains:
 *
 * exploration continuity authority
 */

/* ============================================================================
🔥 Discover Product
============================================================================ */

export type DiscoverProduct = {

  /* ========================================
  Identity
  ======================================== */

  id?: number

  unique_id?: string

  /* ========================================
  Basic
  ======================================== */

  name?: string

  maker?: string

  description?: string

  /* ========================================
  Media
  ======================================== */

  image_url?: string

  /* ========================================
  Pricing
  ======================================== */

  price?: number

  /* ========================================
  Semantic
  ======================================== */

  semantic_role?: string

  semantic_weight?: number

  semantic_score?: number

  semantic_labels?: string[]

  workflow_tags?: string[]

  grouped_attributes?: Record<string, any>

  semantic_runtime?: any

  adaptive_runtime?: any

  render_hints?: Record<string, any>

  /* ========================================
  Discovery
  ======================================== */

  discover_reason?: string

  discover_path?: string

  discover_cluster?: string

  discover_confidence?: number

  /* ========================================
  Raw Backup
  ======================================== */

  raw?: any
}

/* ============================================================================
🔥 Discover Cluster
============================================================================ */

export type DiscoverCluster = {

  id?: string

  slug?: string

  title?: string

  description?: string

  icon?: string

  color?: string

  semantic_weight?: number

  products?: DiscoverProduct[]

  grouped_attributes?: Record<string, any>

  workflow_tags?: string[]

  raw?: any
}

/* ============================================================================
🔥 Discover Path
============================================================================ */

export type DiscoverPath = {

  id?: string

  slug?: string

  title?: string

  description?: string

  intent?: string

  semantic_route?: string[]

  workflow_tags?: string[]

  products?: DiscoverProduct[]

  clusters?: DiscoverCluster[]

  raw?: any
}

/* ============================================================================
🔥 Discover Recommendation
============================================================================ */

export type DiscoverRecommendation = {

  id?: string

  type?: string

  title?: string

  description?: string

  reason?: string

  products?: DiscoverProduct[]

  semantic_weight?: number

  workflow_tags?: string[]

  raw?: any
}

/* ============================================================================
🔥 Discover Intent
============================================================================ */

export type DiscoverIntent = {

  id?: string

  slug?: string

  title?: string

  description?: string

  workflow_tags?: string[]

  semantic_labels?: string[]

  products?: DiscoverProduct[]

  clusters?: DiscoverCluster[]

  raw?: any
}

/* ============================================================================
🔥 Discover Runtime
============================================================================ */

export type DiscoverRuntime = {

  /* ========================================
  Runtime
  ======================================== */

  success?: boolean

  semantic_schema_version?: number

  semantic_runtime?: any

  adaptive_runtime?: any

  render_hints?: Record<string, any>

  /* ========================================
  Canonical Continuity
  ======================================== */

  products?: DiscoverProduct[]

  clusters?: DiscoverCluster[]

  paths?: DiscoverPath[]

  recommendations?: DiscoverRecommendation[]

  intents?: DiscoverIntent[]

  /* ========================================
  Exploration Continuity
  ======================================== */

  grouped_attributes?: Record<string, any>

  semantic_graph?: any[]

  workflow_tags?: string[]

  semantic_labels?: string[]

  /* ========================================
  Observability
  ======================================== */

  observatory?: {

    topology_source?: string

    continuity_status?: string

    normalized?: boolean

    runtime_path?: string

    warnings?: string[]
  }

  /* ========================================
  SEO
  ======================================== */

  seo?: any

  faq?: any[]

  breadcrumbs?: any[]

  schemas?: {

    itemSchema?: any

    breadcrumbSchema?: any

    faqSchema?: any

    collectionSchema?: any
  }

  /* ========================================
  Raw Backup
  ======================================== */

  raw?: any
}