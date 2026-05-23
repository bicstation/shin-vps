// ============================================================================
// FILE:
// /shared/lib/api/django/pc/index.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * PC Semantic API Gateway
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * unified frontend-safe semantic API exposure
 *
 * NOT:
 *
 * semantic authority generation
 *
 * Responsibilities:
 *
 * - unified API exposure
 * - continuity-safe exports
 * - adapter aggregation
 * - legacy compatibility stabilization
 *
 * IMPORTANT:
 *
 * Backend remains:
 *
 * semantic authority
 *
 * Adapter layer remains:
 *
 * continuity authority
 */

/* ============================================================================
🔥 Products
============================================================================ */

export * from './products'

/* ============================================================================
🔥 Detail
============================================================================ */

export * from './detail'

/* ============================================================================
🔥 Related
============================================================================ */

export * from './related'

/* ============================================================================
🔥 Search
============================================================================ */

export * from './search'

/* ============================================================================
🔥 Sidebar
============================================================================ */

export * from './sidebar'

/* ============================================================================
🔥 Ranking
============================================================================ */

export * from './ranking'

/* ============================================================================
🔥 Discover
============================================================================ */

export * from './discover'

/* ============================================================================
🔥 Traversal
============================================================================ */

export * from './traversal'

/* ============================================================================
🔥 Semantic
============================================================================ */

export * from './semantic'

/* ============================================================================
🛡️ Legacy Compatibility Imports
============================================================================ */

import {

  fetchProducts,

} from './products'

import {

  searchPC,

} from './search'

import {

  fetchSidebar,

} from './sidebar'

import {

  fetchRanking,

} from './ranking'

import {

  fetchDiscover,

} from './discover'

/* ============================================================================
🛡️ Legacy Compatibility Exports
============================================================================ */

/**
 * Legacy Product Continuity
 */

export const fetchPCProducts =
  fetchProducts

/**
 * Legacy Finder Continuity
 */

export const fetchFinderResult =
  searchPC

/**
 * Legacy Sidebar Continuity
 */

export const fetchMakers =
  fetchSidebar

/**
 * Legacy Ranking Continuity
 */

export const fetchPCRanking =
  fetchRanking

/**
 * Legacy Discover Continuity
 */

export const fetchPCDiscover =
  fetchDiscover

/* ============================================================================
🔥 Runtime Observatory
============================================================================ */

console.log(
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
)

console.log(
  '🔥 SHIN CORE LINX PC API INITIALIZED'
)

console.log({

  products: true,
  detail: true,
  related: true,
  search: true,
  sidebar: true,
  ranking: true,
  discover: true,
  traversal: true,
  semantic: true,

  continuity:
    'healthy',

  runtime:
    'pc-semantic-api-gateway',
})

console.log(
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
)