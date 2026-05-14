// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/orchestration/RankingSemanticFlow.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Sections
========================================= */

import HeroSection
  from '../sections/hero/HeroSection'

import ExplanationSection
  from '../sections/explanation/ExplanationSection'

import GridSection
  from '../sections/grid/GridSection'

import NavigationSection
  from '../sections/navigation/NavigationSection'

/* =========================================
🔥 Types
========================================= */

type Props = {

  slug: string

  products: any[]
}

/* =========================================
🔥 Semantic Flow
========================================= */

export default function
RankingSemanticFlow({
  type,
  products,
}: Props) {

  // ======================================
  // SPLIT
  // ======================================

  const topProduct =
    products?.[0]
    || null

  const otherProducts =
    products?.slice(1)
    || []

  return (

    <>

      {/* ==================================
      HERO
      semantic entry layer
      ================================== */}

      <HeroSection
        type={type}
        topProduct={
          topProduct
        }
      />

      {/* ==================================
      EXPLANATION
      semantic understanding layer
      ================================== */}

      <ExplanationSection
        products={products}
      />

      {/* ==================================
      MAIN GRID
      semantic comparison layer
      ================================== */}

      <GridSection
        products={
          otherProducts
        }
      />

      {/* ==================================
      NAVIGATION
      semantic routing layer
      ================================== */}

      <NavigationSection />

    </>

  )
}