/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import {
  fetchPCProductRanking,
} from '@/shared/lib/api/django/pc/stats'

import styles
  from './page.module.css'

/* =========================================
🔥 HERO
========================================= */

import HomeHero
  from './components/home/hero/HomeHero'

import HomeHeroCapability
  from './components/home/hero/HomeHeroCapability'

import HomeHeroTrust
  from './components/home/hero/HomeHeroTrust'

/* =========================================
🔥 TRUST
========================================= */

import HomeTrustSection
  from './components/home/trust/HomeTrustSection'

/* =========================================
🔥 CAPABILITY
========================================= */

import HomeCapabilitySection
  from './components/home/capability/HomeCapabilitySection'

/* =========================================
🔥 RECOMMENDATION
========================================= */

import HomeRecommendedPaths
  from './components/home/recommendation/HomeRecommendedPaths'

import HomeIntentNav
  from './components/home/recommendation/HomeIntentNav'

/* =========================================
🔥 COMPARE
========================================= */

import HomeTopPick
  from './components/home/compare/HomeTopPick'

import HomeCompareGrid
  from './components/home/compare/HomeCompareGrid'

import HomeQuickCompare
  from './components/home/compare/HomeQuickCompare'

/* =========================================
🔥 GUIDE
========================================= */

import HomeGuideSection
  from './components/home/guide/HomeGuideSection'

/* =========================================
🔥 POPULAR
========================================= */

import HomePopularSection
  from './components/home/recommendation/HomePopularSection'

/* =========================================
🔥 CTA
========================================= */

import HomeBottomCTA
  from './components/home/cta/HomeBottomCTA'

import HomeStickyCTA
  from './components/home/cta/HomeStickyCTA'

/* =========================================
🔥 EMPTY
========================================= */

import HomeEmpty
  from './components/home/common/HomeEmpty'

/* =========================================
🔥 DYNAMIC
========================================= */

export const dynamic =
  'force-dynamic'

/* =========================================
🔥 PAGE
========================================= */

export default async function HomePage() {

  /* ======================================
  FETCH
  ====================================== */

  const products =
    await fetchPCProductRanking(
      'score'
    )

  /* ======================================
  EMPTY
  ====================================== */

  if (
    !products?.length
  ) {

    return (
      <HomeEmpty />
    )

  }

  /* ======================================
  SPLIT
  ====================================== */

  const topProduct =
    products?.[0]
    || null

  const compareProducts =
    products.slice(1, 4)

  const popularProducts =
    products.slice(0, 8)

  /* ======================================
  RENDER
  ====================================== */

  return (

    <main
      className={
        styles.page
      }
    >

      {/* ===================================
      HERO
      recommendation gateway
      =================================== */}

      <HomeHero
        product={
          topProduct
        }
      />

      {/* ===================================
      HERO CAPABILITY
      what you can do
      =================================== */}

      <HomeHeroCapability />

      {/* ===================================
      HERO TRUST
      confidence entry
      =================================== */}

      <HomeHeroTrust />

      {/* ===================================
      TRUST SECTION
      anxiety reduction
      =================================== */}

      <HomeTrustSection />

      {/* ===================================
      CAPABILITY SECTION
      semantic capability
      =================================== */}

      <HomeCapabilitySection />

      {/* ===================================
      TOP PICK
      strongest recommendation
      =================================== */}

      <HomeTopPick
        product={
          topProduct
        }
      />

      {/* ===================================
      RECOMMENDED PATHS
      recommendation gateway
      =================================== */}

      <HomeRecommendedPaths />

      {/* ===================================
      QUICK COMPARE
      compare cognition
      =================================== */}

      <HomeQuickCompare />

      {/* ===================================
      COMPARE GRID
      semantic compare
      =================================== */}

      <HomeCompareGrid
        products={
          compareProducts
        }
      />

      {/* ===================================
      INTENT NAV
      recommendation intent
      =================================== */}

      <HomeIntentNav />

      {/* ===================================
      GUIDE
      decision support
      =================================== */}

      <HomeGuideSection />

      {/* ===================================
      POPULAR
      semantic popularity
      =================================== */}

      <HomePopularSection
        products={
          popularProducts
        }
      />

      {/* ===================================
      CTA
      continuation
      =================================== */}

      <HomeBottomCTA />

      {/* ===================================
      STICKY CTA
      mobile continuation
      =================================== */}

      <HomeStickyCTA />

    </main>

  )

}