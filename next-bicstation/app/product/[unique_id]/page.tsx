// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/[unique_id]/page.tsx

/* eslint-disable @next/next/no-img-element */

import styles
  from './page.module.css'

/* =========================================
🔥 Navigation
========================================= */

import {
  notFound,
} from 'next/navigation'

/* =========================================
🔥 API
========================================= */

import {

  fetchPCDetail,

  fetchRelatedPC,

  fetchSidebar,

} from '@/shared/lib/api/django/pc'

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
  from './states/ProductEmptyState'

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

export default async function
ProductPage({

  params,

}: Props) {

  // ======================================
  // Params
  // ======================================

  const {
    unique_id,
  } = params

  // ======================================
  // Fetch
  // ======================================

  const [

    product,

    relatedProducts,

    sidebar,

  ] = await Promise.all([

    fetchPCDetail(
      unique_id
    ),

    fetchRelatedPC(
      unique_id
    ),

    fetchSidebar(),
  ])

  // ======================================
  // Empty
  // ======================================

  if (!product) {

    return (
      <ProductEmpty />
    )
  }

console.log({

  ProductHeroSection,

  ProductCapabilitySection,

  ProductTrustLayer,

  ProductSemanticSection,

  ProductSpecSection,

  ProductComparisonSection,

  ProductRelatedSection,

  ProductFaq,

  ProductCTASection,

})




  // ======================================
  // Page
  // ======================================

  return (

    <main
      className={
        styles.mainWrapper
      }
    >

      {/* ==================================
      HERO
      ================================== */}

      <ProductHeroSection
        product={product}
      />

      {/* ==================================
      CAPABILITY
      ================================== */}

      <ProductCapabilitySection
        product={product}
      />

      {/* ==================================
      TRUST
      ================================== */}

      <ProductTrustLayer
        product={product}
      />

      {/* ==================================
      SEMANTIC
      ================================== */}

      <ProductSemanticSection
        product={product}
      />

      {/* ==================================
      SPEC
      ================================== */}

      <ProductSpecSection
        product={product}
      />

      {/* ==================================
      COMPARISON
      ================================== */}

      <ProductComparisonSection
        product={product}

        sidebar={sidebar}
      />

      {/* ==================================
      RELATED
      ================================== */}

      <ProductRelatedSection

        product={product}

        products={
          relatedProducts
        }
      />

      {/* ==================================
      FAQ
      ================================== */}

      <ProductFaq
        product={product}
      />

      {/* ==================================
      CTA
      ================================== */}

      <ProductCTASection
        product={product}
      />

    </main>

  )
}