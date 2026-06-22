// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductHeroSection.tsx
// Product Runtime Hero Orchestrator V4
// ============================================================================

import ProductBreadcrumb
  from '../common/ProductBreadcrumb'

import ProductHero
  from './ProductHero'

import ProductAISummary
  from './ProductAISummary'

import ProductHeroCapability
  from './ProductHeroCapability'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product: any

  semanticRuntime?: {

    semantic_summary?: string

    workflow_tags?: any[]

    semantic_labels?: any[]

    grouped_attributes?: Record<
      string,
      any[]
    >

  }

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductHeroSection({

  product,
  semanticRuntime,

}: Props) {

  return (

    <>

      {/* ==========================================================
      BREADCRUMB
      ========================================================== */}

      <ProductBreadcrumb
        breadcrumbs={
          product?.breadcrumbs
        }
      />

      {/* ==========================================================
      HERO
      世界観
      ========================================================== */}

      <ProductHero
        product={
          product
        }
        semanticRuntime={
          semanticRuntime
        }
      />

      {/* ==========================================================
      AI SUMMARY
      意味
      ========================================================== */}

      <ProductAISummary
        product={
          product
        }
        semanticRuntime={
          semanticRuntime
        }
      />

      {/* ==========================================================
      CAPABILITY
      できること
      ========================================================== */}

      <ProductHeroCapability
        product={
          product
        }
        semanticRuntime={
          semanticRuntime
        }
      />

    </>

  )

}