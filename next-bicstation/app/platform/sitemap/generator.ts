// ============================================================================
// FILE:
// /shared/lib/platform/sitemap/generator.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Platform Runtime
 * Sitemap Generator
 * ============================================================================
 *
 * PURPOSE
 *
 * Platform Runtime
 *
 * ↓
 *
 * MetadataRoute.Sitemap
 *
 * This module SHALL:
 *
 * ✓ Generate public sitemap entries
 * ✓ Convert Runtime into public URLs
 * ✓ Deduplicate URLs
 *
 * This module SHALL NOT:
 *
 * ✗ Fetch Runtime
 * ✗ Generate Semantic Meaning
 * ✗ Generate Runtime
 *
 * ============================================================================
 */

import type {
  MetadataRoute,
} from 'next'

import type {
  NavigationRuntimeItem,
} from '@/shared/lib/api/django/pc/navigation/contracts'

import type {
  PCProductItem,
} from '@/shared/lib/api/django/pc/products/contracts'

import {
  BASE_URL,
  STATIC_ROUTES,
  ENABLE_RANKING_DETAIL,
  PRIORITY,
  CHANGE_FREQUENCY,
} from './constants'

/* ============================================================================
🔥 Generate Static URLs
============================================================================ */

export function generateStaticUrls(
  now: Date,
): MetadataRoute.Sitemap {

  return STATIC_ROUTES.map(
    route => ({

      url:
        `${BASE_URL}${route.path}`,

      lastModified:
        now,

      changeFrequency:
        route.changeFrequency,

      priority:
        route.priority,

    })
  )

}

/* ============================================================================
🔥 Generate Discover URLs
============================================================================ */

export function generateDiscoverUrls(
  intents: NavigationRuntimeItem[],
  now: Date,
): MetadataRoute.Sitemap {

  return intents

    .filter(
      intent =>
        Boolean(
          intent.slug
        )
    )

    .map(
      intent => ({

        url:
          `${BASE_URL}/discover/${intent.slug}`,

        lastModified:
          now,

        changeFrequency:
          CHANGE_FREQUENCY.DAILY,

        priority:
          PRIORITY.DISCOVER_INTENT,

      })
    )

}

/* ============================================================================
🔥 Generate Ranking URLs
============================================================================ */

export function generateRankingUrls(
  intents: NavigationRuntimeItem[],
  now: Date,
): MetadataRoute.Sitemap {

  if (
    !ENABLE_RANKING_DETAIL
  ) {

    return []

  }

  return intents

    .filter(
      intent =>
        Boolean(
          intent.slug
        )
    )

    .map(
      intent => ({

        url:
          `${BASE_URL}/ranking/${intent.slug}`,

        lastModified:
          now,

        changeFrequency:
          CHANGE_FREQUENCY.DAILY,

        priority:
          PRIORITY.RANKING_INTENT,

      })
    )

}

/* ============================================================================
🔥 Generate Product URLs
============================================================================ */

export function generateProductUrls(
  products: PCProductItem[],
  now: Date,
): MetadataRoute.Sitemap {

  return products

    .filter(
      product =>
        Boolean(
          product.unique_id
        )
    )

    .map(
      product => ({

        url:
          `${BASE_URL}/product/${product.unique_id}`,

        lastModified:
          product.updated_at
            ? new Date(
                product.updated_at
              )
            : now,

        changeFrequency:
          CHANGE_FREQUENCY.WEEKLY,

        priority:
          PRIORITY.PRODUCT,

      })
    )

}

/* ============================================================================
🔥 Deduplicate
============================================================================ */

export function deduplicateUrls(
  urls: MetadataRoute.Sitemap,
): MetadataRoute.Sitemap {

  return Array.from(

    new Map(

      urls.map(
        item => [

          item.url,

          item,

        ]
      )

    ).values()

  )

}