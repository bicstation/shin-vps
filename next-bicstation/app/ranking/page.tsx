// ============================================================================
// FILE:
// /app/ranking/page.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Page
 * ============================================================================
 *
 * PURPOSE
 *
 * Platform Runtime Entry.
 *
 * This module SHALL:
 *
 * ✓ Fetch Ranking Runtime
 * ✓ Compose Platform Runtime
 * ✓ Generate Metadata
 * ✓ Pass Runtime to Frontend
 *
 * This module SHALL NOT:
 *
 * ✗ Render UI
 * ✗ Manage State
 * ✗ Generate Meaning
 *
 * ============================================================================
 */

import type {
  Metadata,
} from 'next'

/* ============================================================================
🔥 Publishing
============================================================================ */

import {

  buildRankingMetadata,

  createJsonLdGraph,

} from '@/shared/publishing'

import {

  toNextMetadata,

} from '@/app/publishing/next'



/* ============================================================================
🔥 Runtime
============================================================================ */

import {

  fetchNavigationRuntime,

} from '@/shared/lib/api/django/pc/navigation'

import {

  getRankingRuntime,

} from '@/shared/lib/api/django/pc/ranking'

/* ============================================================================
🔥 Frontend
============================================================================ */

import RankingRuntimeOrchestrator
  from './orchestration/RankingRuntimeOrchestrator'


/* ============================================================================
🔥 JSON-LD
============================================================================ */

export async function generateJsonLd() {

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
        'PCランキング一覧',

      description:
        '人気・用途別おすすめPCランキング',

      url:
        'https://bicstation.com/ranking',

    },

  })

}


/* ============================================================================
🔥 Metadata
============================================================================ */

export const metadata: Metadata =

  toNextMetadata(

    buildRankingMetadata(

      'all',

      {

        title:
          'PCランキング一覧｜人気・用途別おすすめPC｜BIC STATION',

        description:
          'AI・ゲーム・動画編集・ビジネスなど用途別におすすめPCランキングを掲載しています。',

      },

    ),

  )

  /* ============================================================================
🔥 Ranking Page
============================================================================ */

export default async function Page() {

  /* --------------------------------------------------------------------------
  Navigation Runtime
  -------------------------------------------------------------------------- */

  const navigationRuntime =

    await fetchNavigationRuntime()

  /* --------------------------------------------------------------------------
  Ranking Runtime
  -------------------------------------------------------------------------- */

  const rankingRuntime =

    await getRankingRuntime(

      'all',

    )

  /* --------------------------------------------------------------------------
  Platform Runtime
  -------------------------------------------------------------------------- */

  const runtime = {

    navigationRuntime,

    rankingRuntime,

    rankingCategories:

      rankingRuntime.projection.categories,

    semantic_runtime: true,

    adaptive_runtime: true,

  }

    /* --------------------------------------------------------------------------
  Render
  -------------------------------------------------------------------------- */

  return (

    <RankingRuntimeOrchestrator

      runtime={

        runtime

      }

    />

  )

}

