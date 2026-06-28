// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/discover-detail/contracts.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Detail Runtime Contracts
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
 * Discover Detail Runtime Reality
 *
 * NOT:
 *
 * UI Projection
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Discover Detail Attribute
============================================================================ */

export interface DiscoverDetailAttribute {

  type?: string

  name?: string

  slug?: string

  title?: string

  description?: string

  order?: string

  is_adult?: string

  semantic_role?: string

  semantic_weight?: string

  icon?: string

  color?: string

  is_ranking_enabled?: string

}

/* ============================================================================
🔥 Discover Detail Product
============================================================================ */

export interface DiscoverDetailProduct {

  unique_id: string

  name: string

  maker?: string

  price?: number

  image_url?: string

}

/* ============================================================================
🔥 Discover Detail Runtime Response
============================================================================ */

export interface DiscoverDetailRuntimeResponse {

  found: boolean

  group_slug: string

  group_name?: string

  type?: string

  parent_group?: string

  icon?: string

  color?: string

  sort_order?: string

  description?: string

  attribute?: DiscoverDetailAttribute

  product_count?: number

  aliases: string[]

  related_groups: string[]

  sample_products: DiscoverDetailProduct[]

  ready?: boolean

}

/* ============================================================================
🔥 Discover Detail Runtime
============================================================================ */

export interface DiscoverDetailRuntime {

  found: boolean

  group_slug: string

  group_name?: string

  type?: string

  parent_group?: string

  icon?: string

  color?: string

  sort_order?: string

  description?: string

  attribute?: DiscoverDetailAttribute

  product_count?: number

  aliases: string[]

  related_groups: string[]

  sample_products: DiscoverDetailProduct[]

  ready?: boolean

  raw?: any

}