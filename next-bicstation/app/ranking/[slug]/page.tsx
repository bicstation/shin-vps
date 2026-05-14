/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import type {
  Metadata,
} from 'next'

import styles
  from './page.module.css'

/* =========================================
🔥 API
========================================= */

import {
  fetchRankingProducts,
} from '@/shared/lib/api/django/pc'

/* =========================================
🔥 ORCHESTRATION
========================================= */

import RankingLayout
  from './orchestration/RankingLayout'

import RankingSemanticFlow
  from './orchestration/RankingSemanticFlow'

import RankingConversionFlow
  from './orchestration/RankingConversionFlow'

/* =========================================
🔥 EMPTY
========================================= */

import RankingEmpty
  from './components/RankingEmpty'

/* =========================================
🔥 TYPES
========================================= */

type Props = {

  params: {
    slug: string
  }
}

/* =========================================
🔥 ISR
========================================= */

export const revalidate = 60

/* =========================================
🔥 SEO METADATA
========================================= */

export async function
generateMetadata({
  params,
}: Props): Promise<Metadata> {

  const slug =
    params?.slug
    || 'score'

  // ======================================
  // TITLE
  // ======================================

  const title =

    `${slug}向けおすすめPCランキング | BIC STATION`

  // ======================================
  // DESCRIPTION
  // ======================================

  const description =

    `${slug}用途におすすめのPCを比較。初心者でも選びやすい人気モデルを紹介します。`

  // ======================================
  // CANONICAL
  // ======================================

  const canonical =

    `https://bicstation.com/ranking/${slug}`

  return {

    title,

    description,

    alternates: {
      canonical,
    },

    openGraph: {

      title,

      description,

      url:
        canonical,

      siteName:
        'BIC STATION',

      locale:
        'ja_JP',

      type:
        'website',
    },

    twitter: {

      card:
        'summary_large_image',

      title,

      description,
    },
  }
}

/* =========================================
🔥 PAGE
========================================= */

export default async function
RankingPage({
  params,
}: Props) {

  // ======================================
  // PARAMS
  // ======================================

  const slug =

    params?.slug
    || 'score'

  // ======================================
  // FETCH
  // ======================================

  let products = []

  try {

    const result =

      await fetchRankingProducts(
        slug
      )

    products =

      result?.products
      || []

  } catch (error) {

    console.error(
      '🔥 Ranking Fetch Error'
    )

    console.error(
      error
    )
  }

  // ======================================
  // DEBUG
  // ======================================

  console.log(
    '\n🔥 ====================================='
  )

  console.log(
    '🔥 RANKING DETAIL PAGE'
  )

  console.log({

    slug,

    productCount:
      products?.length
      || 0,

    firstProduct:

      products?.[0]
      ? {

          unique_id:
            products[0]
              ?.unique_id,

          name:
            products[0]
              ?.name,

          maker:
            products[0]
              ?.maker,

        }

      : null,

  })

  console.log(
    '🔥 COMPONENTS'
  )

  console.log({

    RankingLayout,

    RankingSemanticFlow,

    RankingConversionFlow,

    RankingEmpty,

  })

  console.log(
    '🔥 =====================================\n'
  )

  // ======================================
  // EMPTY
  // ======================================

  if (
    !products?.length
  ) {

    return (
      <RankingEmpty />
    )
  }

  // ======================================
  // PAGE
  // ======================================

  return (

    <main
      className={
        styles.page
      }
    >

      <RankingLayout>

        {/* ==================================
        SEMANTIC FLOW
        semantic discovery layer
        ================================== */}

        <RankingSemanticFlow

          slug={slug}

          products={products}

        />

        {/* ==================================
        CONVERSION FLOW
        recommendation / commerce layer
        ================================== */}

        <RankingConversionFlow

          slug={slug}

          products={products}

        />

      </RankingLayout>

    </main>

  )
}