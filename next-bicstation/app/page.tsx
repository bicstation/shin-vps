/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import {
  fetchPCProductRanking,
} from '@/shared/lib/api/django/pc/stats'

import styles
  from './page.module.css'

/* =========================================
🔥 Components
========================================= */

import HomeHero
  from './components/HomeHero'

import HomeTopPick
  from './components/HomeTopPick'

import HomeCompareGrid
  from './components/HomeCompareGrid'

import HomeIntentNav
  from './components/HomeIntentNav'

import HomeGuideSection
  from './components/HomeGuideSection'

import HomePopularSection
  from './components/HomePopularSection'

import HomeBottomCTA
  from './components/HomeBottomCTA'

import HomeStickyCTA
  from './components/HomeStickyCTA'

import HomeEmpty
  from './components/HomeEmpty'

/* =========================================
🔥 Dynamic
========================================= */

export const dynamic =
  'force-dynamic'

/* =========================================
🔥 Page
========================================= */

export default async function HomePage() {

  // --------------------------------
  // Fetch
  // --------------------------------
  const products =
    await fetchPCProductRanking(
      'score'
    )

  // --------------------------------
  // Empty
  // --------------------------------
  if (
    !products?.length
  ) {
    return <HomeEmpty />
  }

  // --------------------------------
  // Split
  // --------------------------------
  const topProduct =
    products?.[0]
    || null

  const compareProducts =
    products.slice(1, 4)

  const popularProducts =
    products.slice(0, 6)

  return (
    <main
      className={
        styles.page
      }
    >

      {/* =====================================
      HERO
      「今おすすめ」を断定
      ===================================== */}

      <HomeHero
        product={topProduct}
      />

      {/* =====================================
      TOP PICK
      最有力1台
      ===================================== */}

      <HomeTopPick
        product={topProduct}
      />

      {/* =====================================
      COMPARE
      比較判断支援
      ===================================== */}

      <HomeCompareGrid
        products={
          compareProducts
        }
      />

      {/* =====================================
      INTENT NAV
      目的検索
      ===================================== */}

      <HomeIntentNav />

      {/* =====================================
      GUIDE
      不安除去 / SEO
      ===================================== */}

      <HomeGuideSection />

      {/* =====================================
      POPULAR
      人気構成
      ===================================== */}

      <HomePopularSection
        products={
          popularProducts
        }
      />

      {/* =====================================
      FOOTER CTA
      semantic ranking 導線
      ===================================== */}

      <HomeBottomCTA />

      {/* =====================================
      STICKY CTA
      mobile conversion
      ===================================== */}

      <HomeStickyCTA />

    </main>
  )
}