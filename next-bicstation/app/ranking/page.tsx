// ============================================================================
// FILE:
// /app/ranking/page.tsx
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Universe Page
 * ============================================================================
 *
 * PURPOSE
 *
 * Platform Runtime Entry for the Ranking Universe.
 *
 * This module SHALL:
 *
 * ✓ Fetch Ranking Universe Runtime
 * ✓ Generate Metadata
 * ✓ Pass Runtime to Frontend
 *
 * This module SHALL NOT:
 *
 * ✗ Fetch Navigation Runtime
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
🔥 Ranking Universe Page
============================================================================ */

export default async function Page() {

  const rankingRuntime =
    await getRankingRuntime()

  const runtime = {

    rankingRuntime,

    rankingCategories:
      rankingRuntime.projection.categories,

    semantic_runtime:
      true,

    adaptive_runtime:
      true,

  }

  return (

    <RankingRuntimeOrchestrator
      runtime={runtime}
    />

  )
}