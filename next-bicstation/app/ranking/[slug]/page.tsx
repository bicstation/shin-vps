// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/page.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Detail Page
 * ============================================================================
 *
 * PURPOSE
 *
 * Platform Runtime Entry.
 *
 * This module SHALL:
 *
 * ✓ Fetch Ranking Runtime
 * ✓ Generate Metadata
 * ✓ Generate JSON-LD
 * ✓ Compose Platform Runtime
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

  buildRankingJsonLd,

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

import RankingDetailRuntimeOrchestrator
  from './orchestration/RankingDetailRuntimeOrchestrator'

/* ============================================================================
Props
============================================================================ */

interface RankingPageProps {

  params: Promise<{

    slug: string

  }>

  searchParams: Promise<{

    debug?: string

  }>

}

/* ============================================================================
🔥 JSON-LD
============================================================================ */

export async function generateJsonLd(

  {

    params,

  }: RankingPageProps,

) {

  const {

    slug,

  } = await params

  const ranking =

    await getRankingRuntime(

      slug,

    )

  const seo =

    ranking.runtime.seo ?? {}

  return buildRankingJsonLd(

    slug,

    seo.title ??

      'PCランキング',

    seo.description ??

      'おすすめPCランキング',

  )

}

/* ============================================================================
🔥 Metadata
============================================================================ */

export async function generateMetadata(

  {

    params,

  }: RankingPageProps,

): Promise<Metadata> {

  const {

    slug,

  } = await params

  const ranking =

    await getRankingRuntime(

      slug,

    )

  const seo =

    ranking.runtime.seo ?? {}

  return toNextMetadata(

    buildRankingMetadata(

      slug,

      {

        title:

          seo.title ??

          'PCランキング',

        description:

          seo.description ??

          'おすすめPCランキング',

        keywords:

          Array.isArray(

            seo.keywords,

          )

            ? seo.keywords

            : undefined,

        ...(seo.canonical && {

          canonical:

            seo.canonical,

        }),

      },

    ),

  )

}

/* ============================================================================
🔥 Ranking Detail Page
============================================================================ */

export default async function Page(

  {

    params,

    searchParams,

  }: RankingPageProps,

) {

  /* --------------------------------------------------------------------------
  Route Parameter
  -------------------------------------------------------------------------- */

  const {

    slug,

  } = await params

  const {

    debug,

  } = await searchParams

  /* --------------------------------------------------------------------------
  Ranking Runtime
  -------------------------------------------------------------------------- */

  const ranking =

    await getRankingRuntime(

      slug,

    )

  if (

    !ranking

  ) {

    throw new Error(

      'Ranking Runtime Not Found',

    )

  }

  /* --------------------------------------------------------------------------
  Platform Runtime
  -------------------------------------------------------------------------- */

  const runtime = {

    ranking,
    debug:
      debug === '1',
    semantic_runtime: true,
    adaptive_runtime: true,

  }

  /* --------------------------------------------------------------------------
  Render
  -------------------------------------------------------------------------- */

  return (

    <RankingDetailRuntimeOrchestrator

      runtime={
        runtime
      }

    />

  )

}