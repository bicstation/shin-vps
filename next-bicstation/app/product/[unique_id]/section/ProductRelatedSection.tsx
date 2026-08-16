// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/section/ProductRelatedSection.tsx
//
// SHIN CORE LINX
// Product Discovery Experience Orchestrator
//
// Structure
//
// Product Detail
//      ↓
// Product Related Section
//      │
//      ├── Related Configuration
//      │      └── ProductRelated
//      │
//      ├── Similar Workflow
//      │      └── ProductSimilarUsage
//      │
//      ├── Next Exploration
//      │      └── ProductNextIntent
//      │
//      └── Related Products
//             └── RelatedProducts
//
// Authority
//
// Product Runtime
// Product Semantic Runtime
// Related Product Runtime
//        ↓
// ProductRelatedSection
//        ↓
// Experience Components
//
// This component orchestrates.
// It does not generate semantic meaning.
//
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


/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedProduct,
  ProjectedSemanticRuntime,

} from '@/shared/lib/api/django/pc/product-detail'


/* ============================================================================
🔥 Types
============================================================================ */

type Props = {

  product:
    ProjectedProduct

  related:
    any[]

  semanticRuntime?:
    ProjectedSemanticRuntime

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

      {/* ======================================================================
      RELATED CONFIGURATION
      ====================================================================== */}

      <ProductRelated

        product={
          product
        }

        related={
          related
        }

      />


      {/* ======================================================================
      SIMILAR WORKFLOW
      ====================================================================== */}

      {/* <ProductSimilarUsage

        product={
          product
        }

        related={
          related
        }

        semanticRuntime={
          semanticRuntime
        }

      /> */}


      {/* ======================================================================
      NEXT EXPLORATION
      ====================================================================== */}

      {/* <ProductNextIntent

        product={
          product
        }

        related={
          related
        }

        semanticRuntime={
          semanticRuntime
        }

      /> */}


      {/* ======================================================================
      RELATED PRODUCTS
      ====================================================================== */}

      <RelatedProducts

        related={
          related
        }

      />

    </section>

  )

}