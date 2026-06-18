// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/navigation/contracts.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Runtime Contracts
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
🔥 Navigation Runtime Item
============================================================================ */

export interface NavigationRuntimeItem {

  slug: string

  name: string

  /**
   * Semantic Slug Metadata
   */

  title?: string

  description?: string

  type: string

  icon?: string

  color?: string

  parent_group?: string

  attribute_count?: number

  product_count?: number
}


/* ============================================================================
🔥 Navigation Runtime Response
============================================================================ */

export interface NavigationRuntimeResponse {

  success?: boolean

  semantic_authority?: string

  authority_version?: string

  navigation: NavigationRuntimeItem[]
}

/* ============================================================================
🔥 Navigation Runtime
============================================================================ */

export interface NavigationRuntime {

  semantic_authority?: string

  authority_version?: string

  navigation: NavigationRuntimeItem[]

  raw?: any
}