// ============================================================================
// FILE:
// /shared/lib/platform/sitemap/runtime.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Platform Runtime
 * Sitemap Runtime
 * ============================================================================
 *
 * PURPOSE
 *
 * Semantic Reality
 *
 * ↓
 *
 * Adapter Runtime
 *
 * ↓
 *
 * Platform Runtime
 *
 * ↓
 *
 * Sitemap Generator
 *
 * ============================================================================
 *
 * Platform Runtime SHALL:
 *
 * ✓ Consume canonical Adapter Runtime
 * ✓ Aggregate public Runtime
 * ✓ Delegate URL generation
 *
 * Platform Runtime SHALL NOT:
 *
 * ✗ Generate Semantic Meaning
 * ✗ Generate Presentation
 * ✗ Modify Runtime
 *
 * ============================================================================
 */

import type {
  MetadataRoute,
} from 'next'

/* ============================================================================
🔥 Navigation Runtime
============================================================================ */

import {
  fetchNavigationRuntime,
} from '@/shared/lib/api/django/pc/navigation'

/* ============================================================================
🔥 Product Runtime
============================================================================ */

import {
  fetchProducts,
} from '@/shared/lib/api/django/pc/products'

/* ============================================================================
🔥 Generator
============================================================================ */

import {

  generateStaticUrls,

  generateDiscoverUrls,

  generateRankingUrls,

  generateProductUrls,

  deduplicateUrls,

} from './generator'

/* ============================================================================
🔥 Generate Sitemap
============================================================================ */

export async function generateSitemap(
): Promise<MetadataRoute.Sitemap> {

  const now =
    new Date()

  let urls:
    MetadataRoute.Sitemap = [

      ...generateStaticUrls(
        now
      ),

    ]

  /* ==========================================================================
  Navigation Runtime
  ========================================================================== */

  try {

    const navigationRuntime =
      await fetchNavigationRuntime()

    const intents =
      navigationRuntime.intents ?? []

    urls.push(

      ...generateDiscoverUrls(
        intents,
        now,
      )

    )

    urls.push(

      ...generateRankingUrls(
        intents,
        now,
      )

    )

    console.log(
      '🔥 PLATFORM SITEMAP NAVIGATION',
      {

        intents:
          intents.length,

      }
    )

  }

  catch (error) {

    console.error(

      'PLATFORM SITEMAP NAVIGATION ERROR',

      error,

    )

  }

  /* ==========================================================================
  Product Runtime
  ========================================================================== */

  try {

    const runtime =
      await fetchProducts()

    const products =
      runtime.products ?? []

    urls.push(

      ...generateProductUrls(

        products,

        now,

      )

    )

    console.log(

      '🔥 PLATFORM SITEMAP PRODUCTS',

      {

        products:
          products.length,

      }

    )

  }

  catch (error) {

    console.error(

      'PLATFORM SITEMAP PRODUCT ERROR',

      error,

    )

  }

  /* ==========================================================================
  Deduplicate
  ========================================================================== */

  return deduplicateUrls(
    urls
  )

}