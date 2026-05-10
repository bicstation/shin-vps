// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/orchestration/RankingConversionFlow.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Sections
========================================= */

import TrustSection
  from '../sections/trust/TrustSection'

import QuickCompareSection
  from '../sections/compare/QuickCompareSection'

import RecommendationSection
  from '../sections/recommendation/RecommendationSection'

import BottomCTASection
  from '../sections/cta/BottomCTASection'

import StickyCTASection
  from '../sections/cta/StickyCTASection'

/* =========================================
🔥 Types
========================================= */

type Props = {

  type: string

  products: any[]
}

/* =========================================
🔥 Conversion Flow
========================================= */

export default function
RankingConversionFlow({
  type,
  products,
}: Props) {

  return (

    <>

      {/* ==================================
      TRUST
      beginner reassurance layer
      ================================== */}

      <TrustSection
        type={type}
      />

      {/* ==================================
      QUICK COMPARE
      comparison acceleration
      ================================== */}

      <QuickCompareSection
        products={products}
      />

      {/* ==================================
      RECOMMENDATION
      semantic continuation
      ================================== */}

      <RecommendationSection
        type={type}
      />

      {/* ==================================
      BOTTOM CTA
      conversion orchestration
      ================================== */}

      <BottomCTASection
        type={type}
      />

      {/* ==================================
      MOBILE STICKY CTA
      mobile conversion layer
      ================================== */}

      <StickyCTASection
        type={type}
      />

    </>

  )
}