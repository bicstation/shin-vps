/* eslint-disable @next/next/no-img-element */

import {
  notFound,
} from 'next/navigation'

import {
   fetchSidebar,
} from '@/shared/lib/api/django/pc/'

import styles
  from './page.module.css'

/* =========================================
🔥 HERO
========================================= */

import ProductHeroSection
  from './section/ProductHeroSection'

/* =========================================
🔥 CAPABILITY
========================================= */

import ProductCapabilitySection
  from './section/ProductCapabilitySection'

/* =========================================
🔥 TRUST
========================================= */

import ProductTrustLayer
  from './section/ProductTrustSection'

/* =========================================
🔥 SEMANTIC
========================================= */

import ProductSemanticSection
  from './section/ProductSemanticSection'

  /* =========================================
🔥 SPEC
========================================= */

import ProductSpecSection
  from './section/ProductSpecSection'

/* =========================================
🔥 COMPARISON
========================================= */

import ProductComparisonSection
  from './section/ProductComparisonSection'

/* =========================================
🔥 FAQ
========================================= */

import ProductFaq
  from './components/faq/ProductFaq'

/* =========================================
🔥 RECOMMENDATION
========================================= */

import ProductRelatedSection
  from './section/ProductRelatedSection'

/* =========================================
🔥 CTA
========================================= */

import ProductCTASection
  from './section/ProductCTASection'

/* =========================================
🔥 EMPTY
========================================= */

import ProductEmpty
  from './components/ProductEmpty'


import {
  normalizeProduct,
} from './utils/normalize-product'

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

  const rawProduct =
    json?.product
    || json?.result
    || json
    || null

  const product =

    normalizeProduct(
      rawProduct
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

      <ProductHeroSection
        product={product}
      />

      {/* ==================================
      CAPABILITY
      real-world usage
      ================================== */}

      <ProductCapabilitySection
        product={product}
      />

      {/* ==================================
      TRUST
      decision confidence
      ================================== */}

      <ProductTrustLayer
        product={product}
      />

      {/* ==================================
      SEMANTIC
      recommendation reasoning
      ================================== */}

      <ProductSemanticSection
        product={product}
      />

      {/* ==================================
      SPEC
      secondary information layer
      ================================== */}

      <ProductSpecSection
        product={product}
      />

      {/* ==================================
      COMPARISON
      continuation flow
      ================================== */}

      <ProductComparisonSection
        product={product}
      />

      {/* ==================================
      RELATED
      semantic continuation
      ================================== */}

      <ProductRelatedSection
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

      <ProductCTASection
        product={product}
      />
      
    </main>

  )
}