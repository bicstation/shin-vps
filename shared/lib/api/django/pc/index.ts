// Copyright (c) 2024 Shin Corporation.
// All rights reserved.

/* =========================================
🔥 Products
========================================= */

export * from './products'

/* =========================================
🔥 Detail
========================================= */

export * from './detail'

/* =========================================
🔥 Related
========================================= */

export * from './related'

/* =========================================
🔥 Search
========================================= */

export * from './search'

/* =========================================
🔥 Sidebar
========================================= */

export * from './sidebar'

/* =========================================
🔥 Ranking
========================================= */

export * from './ranking'

/**
 * =====================================================================
 * 🛡️ Legacy Compatibility Imports
 * =====================================================================
 */

import {
  fetchProducts,
} from './products'

import {
  searchPC,
} from './search'

import {
  fetchSidebar,
} from './sidebar'

/**
 * =====================================================================
 * 🛡️ Legacy Compatibility Exports
 * =====================================================================
 */

export const fetchPCProducts =
  fetchProducts

export const fetchFinderResult =
  searchPC

export const fetchMakers =
  fetchSidebar