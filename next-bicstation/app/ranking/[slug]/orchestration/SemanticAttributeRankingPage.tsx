// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/orchestration/SemanticAttributeRankingPage.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Sections
========================================= */

import RankingHeroSection
  from '../../sections/ranking/RankingHeroSection'

import RankingStatsSection
  from '../../sections/ranking/RankingStatsSection'

import ProductRankingSection
  from '../../sections/ranking/ProductRankingSection'

import RelatedAttributeSection
  from '../../sections/ranking/RelatedAttributeSection'

import SemanticInsightSection
  from '../../sections/ranking/SemanticInsightSection'

import RankingFaqSection
  from '../../sections/ranking/RankingFaqSection'

import BreadcrumbSection
  from '../../sections/shared/BreadcrumbSection'

import SchemaSection
  from '../../sections/shared/SchemaSection'

import SeoDescriptionSection
  from '../../sections/shared/SeoDescriptionSection'

/* =========================================
🔥 Runtime
========================================= */

import RuntimeJsonViewer
  from '../../components/runtime/RuntimeJsonViewer'

/* =========================================
🔥 UI
========================================= */

import ErrorState
  from '../../components/ui/ErrorState'

import EmptyState
  from '../../components/ui/EmptyState'

/* =========================================
🔥 Selectors
========================================= */

import {
  selectTopProducts,
} from '../../selectors/ranking/selectTopProducts'

import {
  selectRankingStats,
} from '../../selectors/ranking/selectRankingStats'

import {
  selectRelatedAttributes,
} from '../../selectors/ranking/selectRelatedAttributes'

import {
  selectSemanticInsights,
} from '../../selectors/ranking/selectSemanticInsights'

import {
  selectSemanticMetadata,
} from '../../selectors/ranking/selectSemanticMetadata'

import {
  selectBreadcrumbs,
} from '../../selectors/shared/selectBreadcrumbs'

import {
  selectSchemas,
} from '../../selectors/shared/selectSchemas'

import {
  selectSeo,
} from '../../selectors/shared/selectSeo'

/* =========================================
🔥 Utils
========================================= */

import {
  normalizeRankingRuntime,
} from '../../utils/runtime'

/* =========================================
🔥 Types
========================================= */

type Props = {

  runtime?: any

  slug?: string

  error?: string | null
}

/* =========================================
🔥 Component
========================================= */

export default function
SemanticAttributeRankingPage({

  runtime,

  slug,

  error,

}: Props) {

  /* ======================================
  🔥 Error
  ====================================== */

  if (error) {

    return (

      <main
        style={{
          minHeight: '100vh',

          background:
            '#020617',

          padding:
            '48px',
        }}
      >

        <ErrorState
          title="Semantic Ranking Runtime Error"
          message={error}
        />

      </main>

    )

  }

  /* ======================================
  🔥 Normalize
  ====================================== */

  const normalized =

    normalizeRankingRuntime(
      runtime
    )

  /* ======================================
  🔥 Products
  ====================================== */

  const topProducts =

    selectTopProducts(
      normalized?.products,
      12
    )

  /* ======================================
  🔥 Empty
  ====================================== */

  if (!topProducts.length) {

    return (

      <main
        style={{
          minHeight: '100vh',

          background:
            '#020617',

          padding:
            '48px',
        }}
      >

        <EmptyState
          title="No Ranking Products"
          description={`
semantic ranking runtime
returned empty products.

slug:
${slug || 'unknown'}
`}
        />

        <div
          style={{
            marginTop: '40px',
          }}
        >

          <RuntimeJsonViewer
            runtime={runtime}
          />

        </div>

      </main>

    )

  }

  /* ======================================
  🔥 Selectors
  ====================================== */

  const metadata =

    selectSemanticMetadata(
      normalized
    )

  const stats =

    selectRankingStats(
      normalized
    )

  const relatedAttributes =

    selectRelatedAttributes(
      normalized
    )

  const insights =

    selectSemanticInsights(
      normalized
    )

  const breadcrumbs =

    selectBreadcrumbs(
      normalized
    )

  const schemas =

    selectSchemas(
      normalized
    )

  const seo =

    selectSeo(
      normalized
    )

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
      SCHEMA
      ================================== */}

      <SchemaSection
        schemas={schemas}
      />

      {/* ==================================
      HERO
      ================================== */}

      <section
        style={{
          padding:
            '48px 24px 0',
        }}
      >

        <div
          style={{
            maxWidth: '1440px',

            margin:
              '0 auto',

            display: 'grid',

            gap: '32px',
          }}
        >

          <BreadcrumbSection
            items={breadcrumbs}
          />

          <RankingHeroSection
            metadata={metadata}
            topProduct={topProducts[0]}
          />

        </div>

      </section>

      {/* ==================================
      CONTENT
      ================================== */}

      <section
        style={{
          padding:
            '48px 24px 120px',
        }}
      >

        <div
          style={{
            maxWidth: '1440px',

            margin:
              '0 auto',

            display: 'grid',

            gap: '120px',
          }}
        >

          {/* ==============================
          SEO
          ============================== */}

          <SeoDescriptionSection
            seo={seo}
          />

          {/* ==============================
          STATS
          ============================== */}

          <RankingStatsSection
            stats={stats}
          />

          {/* ==============================
          PRODUCTS
          ============================== */}

          <ProductRankingSection
            products={topProducts}
          />

          {/* ==============================
          INSIGHTS
          ============================== */}

          <SemanticInsightSection
            insights={insights}
          />

          {/* ==============================
          RELATED
          ============================== */}

          <RelatedAttributeSection
            attributes={
              relatedAttributes
            }
          />

          {/* ==============================
          FAQ
          ============================== */}

          <RankingFaqSection
            faq={
              normalized?.faq
            }
          />

          {/* ==============================
          DEBUG
          ============================== */}

          <RuntimeJsonViewer
            title="Semantic Ranking Runtime JSON"
            runtime={runtime}
            collapsed
          />

        </div>

      </section>

    </main>

  )
}