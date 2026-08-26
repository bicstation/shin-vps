// ============================================================================
// FILE:
// /shared/lib/platform/sitemap/runtime.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

import type {
  MetadataRoute,
} from 'next'

import {
  unstable_cache,
} from 'next/cache'

import {
  fetchNavigationRuntime,
} from '@/shared/lib/api/django/pc/navigation'

import {
  fetchProducts,
} from '@/shared/lib/api/django/pc/products'

import {
  generateStaticUrls,
  generateDiscoverUrls,
  generateRankingUrls,
  generateProductUrls,
  deduplicateUrls,
} from './generator'

/* ============================================================================
🔥 Sitemap Generation
============================================================================ */

async function buildSitemap(
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

    const firstRuntime =
      await fetchProducts()

    const firstData =
      firstRuntime.data

    const allProducts = [

      ...(firstData?.products ?? []),

    ]

    let page =
      firstData?.page ?? 1

    let hasNext =
      firstData?.has_next ?? false

    const pageSize =
      firstData?.page_size ?? 20

    /* ------------------------------------------------------------------------
    Remaining Pages
    ------------------------------------------------------------------------ */

    while (hasNext) {

      page += 1

      const runtime =
        await fetchProducts(

          page,

          pageSize,

          {
            sort: 'new',
          }

        )

      const data =
        runtime.data

      allProducts.push(

        ...(data?.products ?? [])

      )

      hasNext =
        data?.has_next ?? false

    }

    /* ------------------------------------------------------------------------
    Generate Product URLs
    ------------------------------------------------------------------------ */

    urls.push(

      ...generateProductUrls(

        allProducts,

        now,

      )

    )

    console.log(
      '🔥 PLATFORM SITEMAP PRODUCTS',
      {
        products:
          allProducts.length,

        pages:
          page,

        expected:
          firstData?.count ?? 0,
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

/* ============================================================================
🔥 Cached Sitemap
============================================================================ */

const getCachedSitemap =
  unstable_cache(

    async () => {

      console.log(
        '🔥 SITEMAP CACHE MISS'
      )

      return buildSitemap()

    },

    [
      'bicstation-sitemap',
    ],

    {
      revalidate:
        3600,

      tags: [
        'bicstation-sitemap',
      ],

    }

  )

/* ============================================================================
🔥 Generate Sitemap
============================================================================ */

export async function generateSitemap(
): Promise<MetadataRoute.Sitemap> {

  console.log(
    '🔥 PLATFORM SITEMAP REQUEST'
  )

  const sitemap =
    await getCachedSitemap()

  console.log(
    '🔥 PLATFORM SITEMAP READY',
    {
      urls:
        sitemap.length,
    }
  )

  return sitemap

}