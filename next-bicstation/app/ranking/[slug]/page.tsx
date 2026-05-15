// /home/maya/shin-vps/next-bicstation/app/ranking/[slug]/page.tsx

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

  const title =
    `${slug}向けおすすめPCランキング | BIC STATION`

  const description =
    `${slug}用途におすすめのPCを比較。初心者でも選びやすい人気モデルを紹介します。`

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

  const slug =
    params?.slug
    || 'score'

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

  /* ======================================
  🔥 SCHEMA
  ====================================== */

  const itemListSchema = {

    '@context':
      'https://schema.org',

    '@type':
      'ItemList',

    name:
      `${slug}向けおすすめPCランキング`,

    itemListElement:

      products.map(
        (
          product,
          index
        ) => ({

          '@type':
            'ListItem',

          position:
            index + 1,

          url:
            `https://bicstation.com/pc/${product.unique_id}`,
        })
      ),
  }

  const breadcrumbSchema = {

    '@context':
      'https://schema.org',

    '@type':
      'BreadcrumbList',

    itemListElement: [

      {
        '@type':
          'ListItem',

        position: 1,

        name:
          'ホーム',

        item:
          'https://bicstation.com',
      },

      {
        '@type':
          'ListItem',

        position: 2,

        name:
          'ランキング',

        item:
          'https://bicstation.com/ranking/score',
      },

      {
        '@type':
          'ListItem',

        position: 3,

        name:
          `${slug}向けPC`,

        item:
          `https://bicstation.com/ranking/${slug}`,
      },
    ],
  }

  const faqSchema = {

    '@context':
      'https://schema.org',

    '@type':
      'FAQPage',

    mainEntity: [

      {
        '@type':
          'Question',

        name:
          `${slug}向けPCは初心者でも使えますか？`,

        acceptedAnswer: {

          '@type':
            'Answer',

          text:
            '用途別におすすめ構成を比較しているため、初心者でも選びやすくなっています。',
        },
      },

      {
        '@type':
          'Question',

        name:
          `${slug}用途ではGPU性能が重要ですか？`,

        acceptedAnswer: {

          '@type':
            'Answer',

          text:
            'AI画像生成・ゲーム・動画編集などではGPU性能が快適性へ大きく影響します。',
        },
      },
    ],
  }

  /* ======================================
  🔥 EMPTY
  ====================================== */

  if (
    !products?.length
  ) {

    return (
      <RankingEmpty />
    )
  }

  /* ======================================
  🔥 PAGE
  ====================================== */

  return (

    <>

      {/* ==================================
      STRUCTURED DATA
      ================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              itemListSchema
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              breadcrumbSchema
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              faqSchema
            ),
        }}
      />

      <main
        className={
          styles.page
        }
      >

        <RankingLayout>

          {/* ==================================
          SEMANTIC FLOW
          ================================== */}

          <RankingSemanticFlow

            slug={slug}

            products={products}

          />

          {/* ==================================
          CONVERSION FLOW
          ================================== */}

          <RankingConversionFlow

            slug={slug}

            products={products}

          />

        </RankingLayout>

      </main>

    </>

  )
}