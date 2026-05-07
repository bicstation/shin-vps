/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'

import HeroRankingCard
  from '@/shared/components/organisms/cards/HeroRankingCard'

import ProductCard
  from '@/shared/components/organisms/cards/ProductCard'

import SemanticSection
  from '@/shared/components/semantic/SemanticSection'

import {
  fetchPCProductRanking,
} from '@/shared/lib/api/django/pc/stats'

import styles from './page.module.css'

/* =========================================
🔥 ISR
========================================= */

export const revalidate = 60

/* =========================================
🔥 Types
========================================= */

type Props = {
  params: Promise<{
    slug: string
  }>
}

/* =========================================
🔥 Semantic Hero Copy
========================================= */

const semanticLandingCopy:
  Record<
    string,
    {
      title: string
      description: string
    }
  > = {

  gaming: {
    title:
      'ゲーム向けおすすめPC',

    description:
      '高FPS・高性能GPU構成を中心に、ゲーム用途に最適なPCを比較できます。',
  },

  work: {
    title:
      '仕事向けおすすめPC',

    description:
      'ビジネス・事務・作業効率を重視したおすすめ構成。',
  },

  creator: {
    title:
      '動画編集向けおすすめPC',

    description:
      '動画編集・配信・クリエイティブ作業向けの高性能構成。',
  },
}

/* =========================================
🔥 Utils
========================================= */

function buildSemanticTitle(
  slug: string
) {

  // GPU
  if (
    slug.startsWith('gpu-')
  ) {

    const gpu =
      slug
        .replace('gpu-', '')
        .replaceAll('-', ' ')
        .toUpperCase()

    return {
      title:
        `${gpu}搭載おすすめPC`,

      description:
        `${gpu}を搭載した高性能PCを比較できます。ゲーム・動画編集・AI用途にも対応。`,
    }
  }

  // Usage
  if (
    slug.startsWith(
      'usage-'
    )
  ) {

    const usage =
      slug.replace(
        'usage-',
        ''
      )

    return (
      semanticLandingCopy[
        usage
      ] || {
        title:
          'おすすめPCランキング',

        description:
          '用途別に最適なPCを比較できます。',
      }
    )
  }

  // Maker
  if (
    slug.startsWith(
      'maker-'
    )
  ) {

    const maker =
      slug
        .replace(
          'maker-',
          ''
        )
        .toUpperCase()

    return {
      title:
        `${maker}おすすめPC`,

      description:
        `${maker}ブランドの人気PCを比較できます。`,
    }
  }

  // Default
  return {
    title:
      'おすすめPCランキング',

    description:
      'semantic recommendation に基づくおすすめPC一覧。',
  }
}

/* =========================================
🔥 Empty
========================================= */

function EmptyState() {

  return (
    <div className={styles.empty}>

      <h2>
        ⚠️ データがありません
      </h2>

      <p>
        semantic ranking が取得できませんでした
      </p>

      <Link href="/">
        →
        TOPへ戻る
      </Link>

    </div>
  )
}

/* =========================================
🔥 Semantic Hero
========================================= */

function SemanticHero({
  slug,
  topProduct,
}: {
  slug: string
  topProduct: any
}) {

  const copy =
    buildSemanticTitle(
      slug
    )

  return (
    <section className={styles.hero}>

      {/* label */}
      <div className={styles.heroLabel}>
        SEMANTIC RANKING
      </div>

      {/* title */}
      <h1 className={styles.heroTitle}>
        {copy.title}
      </h1>

      {/* description */}
      <p className={styles.heroDescription}>
        {copy.description}
      </p>

      {/* hero card */}
      {topProduct && (
        <HeroRankingCard
          product={topProduct}
        />
      )}

    </section>
  )
}

/* =========================================
🔥 Semantic Explanation
========================================= */

function SemanticExplanation({
  products,
}: {
  products: any[]
}) {

  if (!products?.length) {
    return null
  }

  // collect grouped
  const groupedMap:
    Record<
      string,
      any[]
    > = {}

  products.forEach(
    (product) => {

      const grouped =
        product
          ?.grouped_attributes
          || {}

      Object.entries(
        grouped
      ).forEach(
        ([group, attrs]) => {

          if (
            !groupedMap[group]
          ) {
            groupedMap[group] = []
          }

          groupedMap[group]
            .push(...attrs)
        }
      )
    }
  )

  return (
    <section
      className={
        styles.explanation
      }
    >

      <div
        className={
          styles.sectionHeader
        }
      >

        <span
          className={
            styles.sectionLabel
          }
        >
          SEMANTIC ANALYSIS
        </span>

        <h2>
          このランキングの特徴
        </h2>

      </div>

      <div
        className={
          styles.explanationGrid
        }
      >

        {Object.entries(
          groupedMap
        )
          .slice(0, 4)
          .map(
            (
              [
                group,
                attrs,
              ]
            ) => (

              <SemanticSection
                key={group}
                title={group}
                groupType={group}
                attributes={attrs}
              />

            )
          )}

      </div>

    </section>
  )
}

/* =========================================
🔥 Product Grid
========================================= */

function ProductGrid({
  products,
}: {
  products: any[]
}) {

  if (!products?.length) {
    return null
  }

  return (
    <section
      className={
        styles.productSection
      }
    >

      <div
        className={
          styles.sectionHeader
        }
      >

        <span
          className={
            styles.sectionLabel
          }
        >
          SEMANTIC PRODUCTS
        </span>

        <h2>
          おすすめ構成一覧
        </h2>

      </div>

      <div className={styles.grid}>

        {products.map(
          (
            product,
            index
          ) => {

            if (
              !product
                ?.unique_id
            ) {
              return null
            }

            return (
              <ProductCard
                key={
                  product.unique_id
                }
                product={
                  product
                }
                rank={
                  index + 1
                }
              />
            )
          }
        )}

      </div>

    </section>
  )
}

/* =========================================
🔥 Navigation
========================================= */

function BottomNavigation() {

  return (
    <section
      className={
        styles.bottomNav
      }
    >

      <Link href="/">
        →
        TOPへ戻る
      </Link>

      <Link href="/ranking">
        →
        他ランキングを見る
      </Link>

    </section>
  )
}

/* =========================================
🔥 Page
========================================= */

export default async function RankingPage({
  params,
}: Props) {

  // --------------------------------
  // Params
  // --------------------------------
  const {
    slug,
  } = await params

  // --------------------------------
  // Fetch
  // --------------------------------
  const products =
    await fetchPCProductRanking(
      slug
    )

  // --------------------------------
  // Empty
  // --------------------------------
  if (
    !products?.length
  ) {
    return <EmptyState />
  }

  // --------------------------------
  // Split
  // --------------------------------
  const topProduct =
    products?.[0]
    || null

  const otherProducts =
    products.slice(1)

  return (
    <main
      className={
        styles.mainWrapper
      }
    >

      {/* ======================== */}
      {/* HERO */}
      {/* ======================== */}

      <SemanticHero
        slug={slug}
        topProduct={
          topProduct
        }
      />

      {/* ======================== */}
      {/* SEMANTIC EXPLANATION */}
      {/* ======================== */}

      <SemanticExplanation
        products={products}
      />

      {/* ======================== */}
      {/* GRID */}
      {/* ======================== */}

      <ProductGrid
        products={
          otherProducts
        }
      />

      {/* ======================== */}
      {/* NAV */}
      {/* ======================== */}

      <BottomNavigation />

    </main>
  )
}