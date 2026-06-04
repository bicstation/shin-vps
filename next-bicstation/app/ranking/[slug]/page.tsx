// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/page.tsx
// ============================================================================

import type {
  Metadata,
} from 'next'

import {
  fetchSemanticRankingRuntime,
} from '@/shared/lib/api/django/pc/ranking/fetchSemanticRankingRuntime'

import {
  RankingRuntime,
  RuntimeDebug,
  RuntimeSchema,
} from './components'

import styles from './RankingSlugPage.module.css'

type PageProps = {
  params: Promise<{
    slug: string
  }>

  searchParams: Promise<{
    debug?: string
  }>
}

/* ============================================================================
🔥 Metadata Runtime Bridge
============================================================================ */

export async function
generateMetadata({

  params,

}: {
  params: Promise<{
    slug: string
  }>
}): Promise<Metadata> {

  /* ==========================================================================
  🔥 Params
  ========================================================================== */

  const { slug } =
    await params

  /* ==========================================================================
  🔥 Runtime Fetch
  ========================================================================== */

  const runtime =
    await fetchSemanticRankingRuntime(
      slug
    )

  const seo =
    runtime?.seo || {}

  /* ==========================================================================
  🔥 Metadata
  ========================================================================== */

  return {

    title:
      seo?.title
      || 'PCランキング',

    description:
      seo?.description
      || 'おすすめPCランキング',

    alternates: {

      canonical:
        seo?.canonical
        || `/ranking/${slug}/`,
    },

    openGraph: {

      title:
        seo?.openGraph?.title
        || seo?.title,

      description:
        seo?.openGraph?.description
        || seo?.description,

      url:
        seo?.canonical
        || `/ranking/${slug}/`,

      siteName:
        'SHIN CORE LINX',

      images:

        Array.isArray(
          seo?.openGraph?.images
        )

          ? seo.openGraph.images

          : [],

      locale:
        'ja_JP',

      type:
        'website',
    },

    twitter: {

      card:
        'summary_large_image',

      title:
        seo?.twitter?.title
        || seo?.title,

      description:
        seo?.twitter?.description
        || seo?.description,

      images:

        Array.isArray(
          seo?.twitter?.images
        )

          ? seo.twitter.images

          : [],
    },

    keywords:

      Array.isArray(
        seo?.keywords
      )

        ? seo.keywords

        : [],
  }
}

/* ============================================================================
🔥 Ranking Slug Page
============================================================================ */

export default async function RankingSlugPage({
  params,
  searchParams,
}: PageProps) {

  /* ==========================================================================
  🔥 Params
  ========================================================================== */

  const { slug } =
    await params

  const { debug } =
    await searchParams

  /* ==========================================================================
  🔥 Runtime Fetch
  ========================================================================== */

  const runtime =
    await fetchSemanticRankingRuntime(
      slug
    )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <main className={styles.page}>

      {/* ================================================================
      Runtime Schema Injection
      ================================================================ */}

      <RuntimeSchema
        schemas={runtime?.schemas}
      />

      {/* ================================================================
      Runtime Experience
      ================================================================ */}

      <RankingRuntime
        runtime={runtime}
      />

      {/* ================================================================
      Debug
      ================================================================ */}

      {debug === '1' && (

        <RuntimeDebug
          runtime={runtime}
        />

      )}

    </main>

  )
}