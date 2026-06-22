import type {
  MetadataRoute,
} from 'next'

import {
  DiscoverDetailRuntime
}
from '@/shared/lib/api/django/pc/discover-detail'

import {
  fetchSemanticRankingRuntime
}
from '@/shared/lib/api/django/pc/ranking'

const BASE_URL =
  'https://bicstation.com'

type SitemapEntry = {
  url: string
  lastModified: Date
  changeFrequency:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
  priority: number
}

export default async function sitemap():
Promise<MetadataRoute.Sitemap> {

  const now = new Date()

  // ======================================
  // TIER 1
  // CORE DISCOVERY
  // ======================================

  const corePages: SitemapEntry[] = [
    {
      url: `${BASE_URL}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/discover`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/finder`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/ranking`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // ======================================
  // DISCOVERY RUNTIME
  // ======================================

  const discoveryRuntime =
    await DiscoverDetailRuntime()

  const discoveryPages: SitemapEntry[] =
    discoveryRuntime.shelves.map(
      (shelf) => ({
        url:
          `${BASE_URL}/discover/${shelf.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      })
    )

  // ======================================
  // RANKING RUNTIME
  // ======================================

  const rankingRuntime =
    await fetchRankingRuntime()

  const rankingPages: SitemapEntry[] =
    rankingRuntime.rankings.map(
      (ranking) => ({
        url:
          `${BASE_URL}/ranking/${ranking.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      })
    )

  // ======================================
  // INVENTORY RUNTIME
  // ======================================

  const inventoryRuntime =
    await fetchInventoryRuntime()

  const productPages: SitemapEntry[] =
    inventoryRuntime.products.map(
      (product) => ({
        url:
          `${BASE_URL}/product/${product.unique_id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    )

  // ======================================
  // MERGE
  // ======================================

  const urls = [
    ...corePages,
    ...discoveryPages,
    ...rankingPages,
    ...productPages,
  ]

  // ======================================
  // DEDUPLICATION
  // ======================================

  const uniqueUrls =
    Array.from(
      new Map(
        urls.map((item) => [
          item.url,
          item,
        ])
      ).values()
    )

  return uniqueUrls
}

