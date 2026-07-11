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
 * ✓ Synchronize SEO / OGP / Twitter
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

import {
  createJsonLdGraph,
} from './jsonld'

/* ============================================================================
🔥 Default
============================================================================ */

export function buildPublishingMetadata(): PublishingMetadata {

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

  const canonical =

    overrides.canonical ??

    createCanonical(path)

  const title =

    overrides.title ??

    defaultMetadata.title

  const description =

    overrides.description ??

    defaultMetadata.description

  return {

    ...buildPublishingMetadata(),

    ...overrides,

    canonical,

    title,

    description,

    openGraph: {

      ...defaultOpenGraph,

      ...overrides.openGraph,

      title,

      description,

      url: canonical,

    },

    twitter: {

      ...defaultTwitter,

      ...overrides.twitter,

      title,

      description,

    },

    robots:

      overrides.robots ??

      defaultRobots,

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

    {

      title:
        'Discover｜用途・性能・ブランドからPCを探す｜BIC STATION',

      description:
        '用途・GPU・CPU・ブランド・価格帯など、さまざまな切り口から最適なPCを探せるDiscoverページです。',

      keywords: [

        'おすすめPC',
        'PC検索',
        '用途別PC',
        'ゲーミングPC',
        'AI画像生成PC',
        '動画編集PC',
        'CPU',
        'GPU',
        'ブランド',
        'BIC STATION',

      ],

      ...overrides,

    },

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


/* ============================================================================
🔥 Discover JSON-LD
============================================================================ */

export function buildDiscoverJsonLd(

  slug?: string,

  title?: string,

  description?: string,

) {

  return createJsonLdGraph({

    breadcrumb: [

      {

        name: 'ホーム',

        path: '/',

      },

      {

        name: 'Discover',

        path: '/discover',

      },

      ...(slug
        ? [

            {

              name:

                title ?? slug,

              path:

                `/discover/${slug}`,

            },

          ]
        : []),

    ],

    collectionPage: {

      name:

        title ?? 'Discover',

      description,

      url: slug

        ? createCanonical(

            `/discover/${slug}`,

          )

        : createCanonical(

            '/discover',

          ),

    },

  })

}

/* ============================================================================
🔥 Ranking JSON-LD
============================================================================ */

export function buildRankingJsonLd(

  slug: string,

  title: string,

  description: string,

) {

  return createJsonLdGraph({

    breadcrumb: [

      {

        name: 'ホーム',

        path: '/',

      },

      {

        name: 'ランキング',

        path: '/ranking',

      },

    ],

    collectionPage: {

      name:

        title,

      description,

      url:

        createCanonical(

          `/ranking/${slug}`,

        ),

    },

  })

}

/* ============================================================================
🔥 Product JSON-LD
============================================================================ */

export function buildProductJsonLd(

  uniqueId: string,

  title: string,

  description?: string,

) {

  return createJsonLdGraph({

    breadcrumb: [

      {

        name: 'ホーム',

        path: '/',

      },

      {

        name: '製品',

        path:

          `/product/${uniqueId}`,

      },

    ],

    product: {

      name:

        title,

      description,

      url:

        createCanonical(

          `/product/${uniqueId}`,

        ),

    },

  })

}

