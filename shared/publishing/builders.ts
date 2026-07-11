// ============================================================================
// FILE:
// /shared/publishing/builders.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Publishing
 * Builders
 * ============================================================================
 *
 * PURPOSE
 *
 * Compose canonical Publishing contracts.
 *
 * This module SHALL:
 *
 * ✓ Compose Publishing contracts
 * ✓ Apply platform defaults
 * ✓ Remain framework independent
 *
 * This module SHALL NOT:
 *
 * ✗ Import Next.js
 * ✗ Fetch APIs
 * ✗ Generate HTML
 *
 * ============================================================================
 */

import {
  defaultMetadata,
  type PublishingMetadata,
} from './metadata'

import {
  defaultOpenGraph,
} from './openGraph'

import {
  defaultTwitter,
} from './twitter'

import {
  defaultRobots,
} from './robots'

import {
  createCanonical,
} from './canonical'

import type {
    TopRuntime,
} from '../lib/api/django/pc/top'


/* ============================================================================
🔥 Default
============================================================================ */

export function buildPublishingMetadata():



PublishingMetadata {

  return {

    ...defaultMetadata,

    canonical:
      createCanonical('/'),

    openGraph:
      defaultOpenGraph,

    twitter:
      defaultTwitter,

    robots:
      defaultRobots,

  }

}



/* ============================================================================
🔥 Page
============================================================================ */

export function buildPageMetadata(

  path: string,

  overrides:
    Partial<PublishingMetadata> = {},

): PublishingMetadata {

  return {

    ...buildPublishingMetadata(),

    canonical:
      createCanonical(path),

    ...overrides,

  }

}

/* ============================================================================
🔥 Product
============================================================================ */

export function buildProductMetadata(

  uniqueId: string,

  overrides:
    Partial<PublishingMetadata> = {},

): PublishingMetadata {

  return buildPageMetadata(

    `/product/${uniqueId}`,

    overrides,

  )

}


/* ============================================================================
🔥 Discover
============================================================================ */

export function buildDiscoverMetadata(

  slug?: string,

  overrides:
    Partial<PublishingMetadata> = {},

): PublishingMetadata {

  return buildPageMetadata(

    slug

      ? `/discover/${slug}`

      : '/discover',

    overrides,

  )

}

/* ============================================================================
🔥 Ranking
============================================================================ */

export function buildRankingMetadata(

  slug: string,

  overrides:
    Partial<PublishingMetadata> = {},

): PublishingMetadata {

  return buildPageMetadata(

    `/ranking/${slug}`,

    overrides,

  )

}

/* ============================================================================
🔥 Finder
============================================================================ */

export function buildFinderMetadata(

  overrides:
    Partial<PublishingMetadata> = {},

): PublishingMetadata {


  
  return buildPageMetadata(

    '/finder',

    overrides,

  )
}


/* ============================================================================
🔥 Top
============================================================================ */
export function buildTopMetadata(

    runtime: TopRuntime,

): PublishingMetadata {

    return buildPageMetadata(

      '/',

      {

        title:
          runtime.seo.title,

        description:
          runtime.seo.description,

        keywords:
          runtime.seo.keywords,

        canonical:
          runtime.seo.canonical,

      },

    )

}



