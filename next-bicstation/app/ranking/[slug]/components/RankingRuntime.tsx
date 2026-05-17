// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/RankingRuntime.tsx
// ============================================================================

'use client'

import { useMemo } from 'react'

import styles from '../RankingSlugPage.module.css'

import {

  RuntimeHero,

  RuntimeBreadcrumbs,

  SemanticFlagshipCard,

  DiscoveryCardGrid,

  ExplorationList,

  RuntimeFAQ,

} from './'

type Props = {
  runtime: any
}

/* ============================================================================
🔥 Ranking Runtime
============================================================================ */

export default function RankingRuntime({
  runtime,
}: Props) {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const products =

    Array.isArray(
      runtime?.products
    )

      ? runtime.products

      : []

  const breadcrumbs =

    Array.isArray(
      runtime?.breadcrumbs
    )

      ? runtime.breadcrumbs

      : []

  const faq =

    Array.isArray(
      runtime?.faq
    )

      ? runtime.faq

      : []

  const seo =
    runtime?.seo || {}

  /* ==========================================================================
  🔥 Semantic Sorting
  ========================================================================== */

  const sortedProducts =
    useMemo(

      () =>

        [...products].sort(

          (a, b) =>

            Number(
              b?.semantic_weight || 0
            )

            -

            Number(
              a?.semantic_weight || 0
            )
        ),

      [products]
    )

  /* ==========================================================================
  🔥 Semantic Hierarchy
  ========================================================================== */

  const flagship =
    sortedProducts?.[0]

  const discoveryProducts =
    sortedProducts.slice(1, 4)

  const explorationProducts =
    sortedProducts.slice(4)

  /* ==========================================================================
  🔥 Runtime Metrics
  ========================================================================== */

  const totalProducts =
    sortedProducts.length

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className={styles.runtimePage}>

      {/* ================================================================
      HERO
      ================================================================ */}

      <RuntimeHero
        seo={seo}
        totalProducts={
          totalProducts
        }
      />

      {/* ================================================================
      BREADCRUMBS
      ================================================================ */}

      <RuntimeBreadcrumbs
        breadcrumbs={
          breadcrumbs
        }
      />

      {/* ================================================================
      FLAGSHIP
      ================================================================ */}

      {flagship && (

        <section
          className={
            styles.runtimeFlagshipSection
          }
        >

          <SemanticFlagshipCard
            product={flagship}
            rank={1}
          />

        </section>

      )}

      {/* ================================================================
      DISCOVERY
      ================================================================ */}

      {discoveryProducts.length > 0 && (

        <section
          className={
            styles.runtimeDiscoverySection
          }
        >

          <div
            className={
              styles.runtimeSectionHeader
            }
          >

            <div
              className={
                styles.runtimeSectionEyebrow
              }
            >

              HIGH RELEVANCE

            </div>

            <h2
              className={
                styles.runtimeSectionTitle
              }
            >

              あなたに近い
              おすすめ候補

            </h2>

            <p
              className={
                styles.runtimeSectionDescription
              }
            >

              semantic runtime が
              高い関連性を検出した
              discovery nodes。

            </p>

          </div>

          <DiscoveryCardGrid
            products={
              discoveryProducts
            }
          />

        </section>

      )}

      {/* ================================================================
      EXPLORATION
      ================================================================ */}

      {explorationProducts.length > 0 && (

        <section
          className={
            styles.runtimeExplorationSection
          }
        >

          <div
            className={
              styles.runtimeSectionHeader
            }
          >

            <div
              className={
                styles.runtimeSectionEyebrow
              }
            >

              SEMANTIC EXPLORATION

            </div>

            <h2
              className={
                styles.runtimeSectionTitle
              }
            >

              さらに探索する

            </h2>

            <p
              className={
                styles.runtimeSectionDescription
              }
            >

              用途・性能・価格帯など、
              semantic runtime をもとに
              探索を継続できます。

            </p>

          </div>

          <ExplorationList
            products={
              explorationProducts
            }
            startRank={5}
          />

        </section>

      )}

      {/* ================================================================
      FAQ
      ================================================================ */}

      {faq.length > 0 && (

        <section
          className={
            styles.runtimeFaqSection
          }
        >

          <RuntimeFAQ
            faq={faq}
          />

        </section>

      )}

    </div>

  )
}