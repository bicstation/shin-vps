// /home/maya/shin-dev/shin-vps/next-bicstation/app/page.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 API
========================================= */

import {
  fetchSidebar,
} from '@/shared/lib/api/django/pc'

/* =========================================
🔥 Semantic
========================================= */

import {
  resolveSemanticPresentation,
} from '@/shared/lib/semantic/semanticPresentation'

/* =========================================
🔥 Styles
========================================= */

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

import HomePopularSection
  from './components/home/recommendation/HomePopularSection'

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

export default async function
HomePage() {

  /* ======================================
  FETCH SIDEBAR
  ====================================== */

  const sidebar =

    await fetchSidebar()

  /* ======================================
  DEBUG
  ====================================== */

  console.log(
    '\n🔥 ====================================='
  )

  console.log(
    '🔥 SIDEBAR'
  )

  console.log(
    JSON.stringify(
      sidebar,
      null,
      2
    )
  )

  console.log(
    '🔥 =====================================\n'
  )

  /* ======================================
  SEMANTIC GROUPS
  ====================================== */

  const usageItems =

    Array.isArray(
      sidebar?.usage
    )

      ? sidebar.usage

      : []

  const gpuItems =

    Array.isArray(
      sidebar?.gpu
    )

      ? sidebar.gpu

      : []

  const cpuItems =

    Array.isArray(
      sidebar?.cpu
    )

      ? sidebar.cpu

      : []

  const makerItems =

    Array.isArray(
      sidebar?.maker
    )

      ? sidebar.maker

      : []

  /* ======================================
  SEMANTIC PRESENTATIONS
  ====================================== */

  const usagePresentations =

    usageItems.map(
      item =>

        resolveSemanticPresentation(
          item
        )
    )

  const gpuPresentations =

    gpuItems.map(
      item =>

        resolveSemanticPresentation(
          item
        )
    )

  const cpuPresentations =

    cpuItems.map(
      item =>

        resolveSemanticPresentation(
          item
        )
    )

  /* ======================================
  DUMMY PRODUCTS
  backend migration phase
  ====================================== */

  const dummyProducts = [

    {
      unique_id:
        'gaming-001',

      name:
        'RTX 4080 搭載 ゲーミングPC',

      maker:
        'GALLERIA',

      price:
        329800,

      image_url:
        '/dummy/gaming.jpg',
    },

    {
      unique_id:
        'creator-001',

      name:
        '4K動画編集 Creator PC',

      maker:
        'Mouse',

      price:
        289800,

      image_url:
        '/dummy/creator.jpg',
    },

    {
      unique_id:
        'ai-001',

      name:
        'AI開発向け RTX AI Workstation',

      maker:
        'Lenovo',

      price:
        398000,

      image_url:
        '/dummy/ai.jpg',
    },
  ]

  /* ======================================
  EMPTY
  ====================================== */

  if (

    !usagePresentations.length

    &&

    !gpuPresentations.length

  ) {

    return (
      <HomeEmpty />
    )
  }

  /* ======================================
  TOP PRODUCT
  ====================================== */

  const topProduct =

    dummyProducts?.[0]
    || null

  const compareProducts =

    dummyProducts.slice(
      0,
      3
    )

  const popularProducts =

    dummyProducts.slice(
      0,
      8
    )

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
      semantic discovery
      =================================== */}

      <HomeHeroCapability />

      {/* ===================================
      HERO TRUST
      confidence
      =================================== */}

      <HomeHeroTrust />

      {/* ===================================
      TRUST SECTION
      =================================== */}

      <HomeTrustSection />

      {/* ===================================
      CAPABILITY SECTION
      =================================== */}

      <HomeCapabilitySection />

      {/* ===================================
      INTENT NAV
      semantic navigation
      =================================== */}

      <HomeIntentNav
        items={
          usagePresentations
        }
      />

      {/* ===================================
      RECOMMENDED PATHS
      semantic recommendations
      =================================== */}

      <HomeRecommendedPaths
        items={
          usagePresentations
        }
      />

      {/* ===================================
      TOP PICK
      =================================== */}

      <HomeTopPick
        product={
          topProduct
        }
      />

      {/* ===================================
      QUICK COMPARE
      =================================== */}

      <HomeQuickCompare
        products={
          compareProducts
        }
      />

      {/* ===================================
      COMPARE GRID
      =================================== */}

      <HomeCompareGrid
        products={
          compareProducts
        }
      />

      {/* ===================================
      GPU POPULAR
      =================================== */}

      <HomePopularSection

        title='人気GPUランキング'

        items={
          gpuPresentations
        }
      />

      {/* ===================================
      CPU POPULAR
      =================================== */}

      <HomePopularSection

        title='CPUランキング'

        items={
          cpuPresentations
        }
      />

      {/* ===================================
      MAKER POPULAR
      =================================== */}

      <HomePopularSection

        title='人気メーカー'

        items={
          makerItems
        }
      />

      {/* ===================================
      GUIDE
      =================================== */}

      <HomeGuideSection />

      {/* ===================================
      CTA
      =================================== */}

      <HomeBottomCTA />

      {/* ===================================
      STICKY CTA
      =================================== */}

      <HomeStickyCTA />

    </main>
  )
}