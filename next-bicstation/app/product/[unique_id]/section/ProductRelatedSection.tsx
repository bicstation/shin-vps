// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/section/ProductRelatedSection.tsx
// ============================================================================

/* ============================================================================
🔥 Components
============================================================================ */

import ProductRelated
  from '../components/recommendation/ProductRelated'

import ProductSimilarUsage
  from '../components/recommendation/ProductSimilarUsage'

import ProductNextIntent
  from '../components/recommendation/ProductNextIntent'

import RelatedProducts
  from '../components/recommendation/RelatedProducts'

import ProductRelatedIntents
  from '../components/intent/ProductRelatedIntents'

/* ============================================================================
🔥 Types
============================================================================ */

type RelatedIntent = {

  slug: string

  title: string

  description?: string | null

}

type Props = {

  product: any

  related: any[]

  semanticRuntime?: {

    related_intents?: RelatedIntent[]

  }

}

/* ============================================================================
🔥 Product Related Section
============================================================================ */

export default function ProductRelatedSection({

  product,

  related,

  semanticRuntime,

}: Props) {

  /* ==========================================================================
  Guard
  ========================================================================== */

  if (!product) {

    return null

  }

  /* ==========================================================================
  Render
  ========================================================================== */

  return (

    <section>

      {/* ==========================================================
      Related Discovery
      ========================================================== */}

      <ProductRelatedIntents
        semanticRuntime={
          semanticRuntime
        }
      />

      {/* ==========================================================
      Related Narrative
      ========================================================== */}

      <ProductRelated
        product={product}
        related={related}
      />

      {/* ==========================================================
      Similar Workflow
      ========================================================== */}

      <ProductSimilarUsage
        product={product}
        related={related}
      />

      {/* ==========================================================
      Next Intent
      ========================================================== */}

      <ProductNextIntent
        product={product}
        related={related}
      />

      {/* ==========================================================
      Exploration Products
      ========================================================== */}

      <RelatedProducts
        related={related}
      />

    </section>

  )

}