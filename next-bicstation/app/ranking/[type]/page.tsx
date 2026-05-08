/* eslint-disable @next/next/no-img-element */

import {
  fetchPCProductRanking,
} from '@/shared/lib/api/django/pc/stats'

import styles
  from './page.module.css'

/* =========================================
🔥 EXISTING COMPONENTS
========================================= */

import RankingHero
  from './components/RankingHero'

import RankingExplanation
  from './components/RankingExplanation'

import RankingGrid
  from './components/RankingGrid'

import RankingNavigation
  from './components/RankingNavigation'

import RankingEmpty
  from './components/RankingEmpty'

/* =========================================
🔥 NEW CONVERSION LAYERS
========================================= */

import RankingTrustSection
  from './components/RankingTrustSection'

import RankingQuickCompare
  from './components/RankingQuickCompare'

import RecommendedForYou
  from './components/RecommendedForYou'

import RankingBottomCTA
  from './components/RankingBottomCTA'

import RankingStickyCTA
  from './components/RankingStickyCTA'

/* =========================================
🔥 ISR
========================================= */

export const revalidate = 60

/* =========================================
🔥 TYPES
========================================= */

type Props = {
  params: {
    type: string
  }
}

/* =========================================
🔥 PAGE
========================================= */

export default async function RankingPage({
  params,
}: Props) {

  // ======================================
  // PARAMS
  // ======================================

  const {
    type,
  } = params

  // ======================================
  // FETCH
  // ======================================

  const products =
    await fetchPCProductRanking(
      type
    )

  // ======================================
  // EMPTY
  // ======================================

  if (
    !products?.length
  ) {
    return <RankingEmpty />
  }

  // ======================================
  // SPLIT
  // ======================================

  const topProduct =
    products?.[0]
    || null

  const otherProducts =
    products.slice(1)

  // ======================================
  // PAGE
  // ======================================

  return (

    <main
      className={
        styles.mainWrapper
      }
    >

      {/* ==================================
      HERO
      comparison start hero
      ================================== */}

      <RankingHero
        type={type}
        topProduct={
          topProduct
        }
      />

      {/* ==================================
      TRUST
      beginner reassurance layer
      ================================== */}

      <RankingTrustSection
        type={type}
      />

      {/* ==================================
      WHY THIS RANKING
      semantic explanation
      ================================== */}

      <RankingExplanation
        products={products}
      />

      {/* ==================================
      QUICK COMPARE
      comparison acceleration
      ================================== */}

      <RankingQuickCompare
        products={products}
      />

      {/* ==================================
      MAIN GRID
      semantic comparison grid
      ================================== */}

      <RankingGrid
        products={
          otherProducts
        }
      />

      {/* ==================================
      RECOMMENDATION
      semantic continuation
      ================================== */}

      <RecommendedForYou
        type={type}
      />

      {/* ==================================
      NAVIGATION
      semantic routing
      ================================== */}

      <RankingNavigation />

      {/* ==================================
      BOTTOM CTA
      comparison conversion
      ================================== */}

      <RankingBottomCTA
        type={type}
      />

      {/* ==================================
      MOBILE STICKY CTA
      mobile conversion layer
      ================================== */}

      <RankingStickyCTA
        type={type}
      />

    </main>

  )
}