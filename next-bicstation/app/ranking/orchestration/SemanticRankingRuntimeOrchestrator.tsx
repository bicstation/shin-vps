// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/orchestration/SemanticRankingRuntimeOrchestrator.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Sections
========================================= */

import RankingHeroSection
  from '../sections/ranking/RankingHeroSection'

import ProductRankingSection
  from '../sections/ranking/ProductRankingSection'

import SemanticInsightSection
  from '../sections/ranking/SemanticInsightSection'

import RelatedAttributeSection
  from '../sections/ranking/RelatedAttributeSection'

import RankingStatsSection
  from '../sections/ranking/RankingStatsSection'

/* =========================================
🔥 Components
========================================= */

import RuntimeDebug
  from '../components/runtime/RuntimeDebug'

/* =========================================
🔥 Selectors
========================================= */

import {
  selectTopProducts,
} from '../selectors/ranking/selectTopProducts'

import {
  selectSemanticInsights,
} from '../selectors/ranking/selectSemanticInsights'

import {
  selectRelatedAttributes,
} from '../selectors/ranking/selectRelatedAttributes'

import {
  selectRankingStats,
} from '../selectors/ranking/selectRankingStats'

/* =========================================
🔥 Types
========================================= */

type Props = {

  slug: string

  runtime?: any

  error?: string | null
}

/* =========================================
🔥 Orchestrator
========================================= */

export default function
SemanticRankingRuntimeOrchestrator({

  slug,

  runtime,

  error,

}: Props) {

  /* ======================================
  🔥 Runtime
  ====================================== */

  const products =

    Array.isArray(
      runtime?.products
    )

      ? runtime.products

      : []

  const semantic =

    runtime?.semantic
    || {}

  /* ======================================
  🔥 Selectors
  ====================================== */

  const topProducts =

    selectTopProducts(
      products
    )

  const insights =

    selectSemanticInsights(
      runtime
    )

  const relatedAttributes =

    selectRelatedAttributes(
      runtime
    )

  const stats =

    selectRankingStats(
      runtime
    )

  /* ======================================
  🔥 Empty
  ====================================== */

  const isEmpty =

    !products.length

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <main
      style={{
        minHeight: '100vh',

        background:
          '#020617',

        color:
          '#ffffff',
      }}
    >

      {/* ==================================
      DEBUG
      ================================== */}

      <RuntimeDebug

        title={
          'Semantic Ranking Runtime'
        }

        runtime={runtime}

        error={error}

      />

      {/* ==================================
      HERO
      ================================== */}

      <RankingHeroSection

        slug={slug}

        semantic={semantic}

        products={topProducts}

      />

      {/* ==================================
      EMPTY
      ================================== */}

      {isEmpty && (

        <div
          style={{
            maxWidth: '1280px',

            margin: '0 auto',

            padding:
              '40px 24px 120px',

            opacity: 0.72,
          }}
        >
          ranking runtime is empty.
        </div>

      )}

      {/* ==================================
      CONTENT
      ================================== */}

      {!isEmpty && (

        <div
          style={{
            display: 'grid',

            gap: '72px',

            maxWidth: '1440px',

            margin: '0 auto',

            padding:
              '0 24px 120px',
          }}
        >

          {/* ==============================
          PRODUCTS
          ============================== */}

          <ProductRankingSection

            products={products}

          />

          {/* ==============================
          INSIGHTS
          ============================== */}

          <SemanticInsightSection

            insights={insights}

          />

          {/* ==============================
          RELATED ATTRIBUTES
          ============================== */}

          <RelatedAttributeSection

            attributes={
              relatedAttributes
            }

          />

          {/* ==============================
          STATS
          ============================== */}

          <RankingStatsSection

            stats={stats}

          />

        </div>

      )}

    </main>

  )
}