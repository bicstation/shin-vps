/* eslint-disable @next/next/no-img-element */

import {
  notFound,
} from 'next/navigation'

import {
  fetchPCProductDetail,
} from '@/shared/lib/api/django/pc/products'

import styles
  from './page.module.css'

/* =========================================
🔥 HERO
========================================= */

import ProductHero
  from './components/hero/ProductHero'

import ProductHeroTrust
  from './components/hero/ProductHeroTrust'

import ProductHeroCapability
  from './components/hero/ProductHeroCapability'

/* =========================================
🔥 CAPABILITY
========================================= */

import ProductCapability
  from './components/capability/ProductCapability'

import ProductUsageExamples
  from './components/capability/ProductUsageExamples'

import ProductPerformanceHighlights
  from './components/capability/ProductPerformanceHighlights'

/* =========================================
🔥 TRUST
========================================= */

import ProductTrustSection
  from './components/trust/ProductTrustSection'

import ProductForWho
  from './components/trust/ProductForWho'

import ProductNotForWho
  from './components/trust/ProductNotForWho'

import ProductDecisionSupport
  from './components/trust/ProductDecisionSupport'

/* =========================================
🔥 SEMANTIC
========================================= */

import ProductSemanticReasons
  from './components/semantic/ProductSemanticReasons'

import ProductSemanticSummary
  from './components/semantic/ProductSemanticSummary'

import ProductSemanticAccordion
  from './components/semantic/ProductSemanticAccordion'

/* =========================================
🔥 SPEC
========================================= */

import ProductSpec
  from './components/spec/ProductSpec'

import ProductCompactSpec
  from './components/spec/ProductCompactSpec'

import ProductRadar
  from './components/spec/ProductRadar'

/* =========================================
🔥 COMPARISON
========================================= */

import ProductComparisonLinks
  from './components/comparison/ProductComparisonLinks'

import ProductAlternativeList
  from './components/comparison/ProductAlternativeList'

import ProductBetterChoiceGuide
  from './components/comparison/ProductBetterChoiceGuide'

/* =========================================
🔥 FAQ
========================================= */

import ProductFaq
  from './components/faq/ProductFaq'

/* =========================================
🔥 RECOMMENDATION
========================================= */

import ProductRelated
  from './components/recommendation/ProductRelated'

import ProductSimilarUsage
  from './components/recommendation/ProductSimilarUsage'

import ProductNextIntent
  from './components/recommendation/ProductNextIntent'

/* =========================================
🔥 CTA
========================================= */

import ProductStickyCTA
  from './components/cta/ProductStickyCTA'

import ProductFinalCTA
  from './components/cta/ProductFinalCTA'

import ProductPriceCTA
  from './components/cta/ProductPriceCTA'

/* =========================================
🔥 EMPTY
========================================= */

import ProductEmpty
  from './components/ProductEmpty'

/* =========================================
🔥 ISR
========================================= */

export const revalidate = 60

/* =========================================
🔥 TYPES
========================================= */

type Props = {
  params: {
    unique_id: string
  }
}

/* =========================================
🔥 PAGE
========================================= */

export default async function ProductPage({
  params,
}: Props) {

  // ======================================
  // PARAMS
  // ======================================

  const {
    unique_id,
  } = params

  // ======================================
  // FETCH
  // ======================================

  const product =
    await fetchPCProductDetail(
      unique_id
    )

  // ======================================
  // EMPTY
  // ======================================

  if (!product) {

    return (
      <ProductEmpty />
    )

  }

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
      first impression
      ================================== */}

      <ProductHero
        product={product}
      />

      <ProductHeroTrust
        product={product}
      />

      <ProductHeroCapability
        product={product}
      />

      {/* ==================================
      CAPABILITY
      real-world usage
      ================================== */}

      <ProductCapability
        product={product}
      />

      <ProductUsageExamples
        product={product}
      />

      <ProductPerformanceHighlights
        product={product}
      />

      {/* ==================================
      TRUST
      decision confidence
      ================================== */}

      <ProductTrustSection
        product={product}
      />

      <ProductForWho
        product={product}
      />

      <ProductNotForWho
        product={product}
      />

      <ProductDecisionSupport
        product={product}
      />

      {/* ==================================
      SEMANTIC
      recommendation reasoning
      ================================== */}

      <ProductSemanticReasons
        product={product}
      />

      <ProductSemanticSummary
        product={product}
      />

      <ProductSemanticAccordion
        product={product}
      />

      {/* ==================================
      SPEC
      secondary information layer
      ================================== */}

      <ProductCompactSpec
        product={product}
      />

      <ProductSpec
        product={product}
      />

      <ProductRadar
        product={product}
      />

      {/* ==================================
      COMPARISON
      continuation flow
      ================================== */}

      <ProductComparisonLinks
        product={product}
      />

      <ProductAlternativeList
        product={product}
      />

      <ProductBetterChoiceGuide
        product={product}
      />

      {/* ==================================
      RELATED
      semantic continuation
      ================================== */}

      <ProductRelated
        product={product}
      />

      <ProductSimilarUsage
        product={product}
      />

      <ProductNextIntent
        product={product}
      />

      {/* ==================================
      FAQ
      anxiety reduction
      ================================== */}

      <ProductFaq
        product={product}
      />

      {/* ==================================
      FINAL CTA
      conversion support
      ================================== */}

      <ProductPriceCTA
        product={product}
      />

      <ProductFinalCTA
        product={product}
      />

      {/* ==================================
      STICKY CTA
      mobile conversion
      ================================== */}

      <ProductStickyCTA
        product={product}
      />

    </main>

  )
}