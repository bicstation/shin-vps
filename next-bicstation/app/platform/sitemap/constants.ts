// ============================================================================
// FILE:
// /shared/lib/platform/sitemap/constants.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Platform Runtime
 * Sitemap Constants
 * ============================================================================
 *
 * PURPOSE
 *
 * Shared Platform configuration for public Sitemap generation.
 *
 * This module defines platform-level constants consumed by
 * Platform Services.
 *
 * It SHALL NOT:
 *
 * ✗ Fetch Runtime
 * ✗ Generate URLs
 * ✗ Generate Semantic Meaning
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Base URL
============================================================================ */

export const BASE_URL =
  'https://bicstation.com'

/* ============================================================================
🔥 Static Routes
============================================================================ */

export const STATIC_ROUTES = [

  {
    path: '',
    priority: 1.0,
    changeFrequency: 'daily' as const,
  },

  {
    path: '/discover',
    priority: 0.9,
    changeFrequency: 'daily' as const,
  },

  {
    path: '/finder',
    priority: 0.9,
    changeFrequency: 'daily' as const,
  },

  {
    path: '/ranking',
    priority: 0.9,
    changeFrequency: 'daily' as const,
  },

]

/* ============================================================================
🔥 Feature Flags
============================================================================ */

/**
 * Enable ranking detail URLs.
 *
 * Example:
 *
 * /ranking/creator
 * /ranking/gaming
 */
export const ENABLE_RANKING_DETAIL =
  false

/* ============================================================================
🔥 Priorities
============================================================================ */

export const PRIORITY = {

  HOME: 1.0,

  DISCOVER: 0.9,

  FINDER: 0.9,

  RANKING: 0.9,

  DISCOVER_INTENT: 0.8,

  RANKING_INTENT: 0.8,

  PRODUCT: 0.7,

} as const

/* ============================================================================
🔥 Change Frequency
============================================================================ */

export const CHANGE_FREQUENCY = {

  DAILY: 'daily',

  WEEKLY: 'weekly',

} as const