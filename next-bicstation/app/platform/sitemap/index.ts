// ============================================================================
// FILE:
// /shared/lib/platform/sitemap/index.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Platform Runtime
 * Sitemap
 * ============================================================================
 *
 * Public entry point for the Sitemap Platform Runtime.
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Runtime
============================================================================ */

export {
  generateSitemap,
} from './runtime'

/* ============================================================================
🔥 Generator
============================================================================ */

export {
  generateStaticUrls,
  generateDiscoverUrls,
  generateRankingUrls,
  generateProductUrls,
  deduplicateUrls,
} from './generator'

/* ============================================================================
🔥 Constants
============================================================================ */

export {
  BASE_URL,
  STATIC_ROUTES,
  ENABLE_RANKING_DETAIL,
  PRIORITY,
  CHANGE_FREQUENCY,
} from './constants'