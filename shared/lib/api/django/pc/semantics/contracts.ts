// ============================================================================
// FILE:
// /home/maya/shin-vps/shared/lib/api/django/pc/semantics/contracts.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Runtime Contracts
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
🔥 Semantic Universe
============================================================================ */

export interface SemanticUniverse {

  universe_slug: string

  universe_title: string

  sort_order?: string

  is_active?: string
}

/* ============================================================================
🔥 Semantic Navigation Item
============================================================================ */

export interface SemanticNavigationItem {

  slug: string

  name: string

  title?: string

  description?: string

  type?: string

  icon?: string

  color?: string

  parent_group?: string

  attribute_count?: number

  product_count?: number
}

/* ============================================================================
🔥 Semantic Runtime Response
============================================================================ */

export interface SemanticRuntimeResponse {

  universes: SemanticUniverse[]

  navigation: SemanticNavigationItem[]
}

/* ============================================================================
🔥 Semantic Runtime
============================================================================ */

export interface SemanticRuntime {

  universes: SemanticUniverse[]

  navigation: SemanticNavigationItem[]

  raw?: any
}