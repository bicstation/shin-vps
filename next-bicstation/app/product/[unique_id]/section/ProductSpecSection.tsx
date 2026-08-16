// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/sections/ProductSpecSection.tsx
//
// SHIN CORE LINX
// Product Specification Experience Orchestrator
//
// Structure
//
// Projected Product
//        ↓
// ProductSpecSection
//        │
//        ├── Quick Specification
//        │      └── ProductCompactSpec
//        │
//        ├── Product Specification
//        │      └── ProductSpec
//        │
//        └── Observation Reality
//               └── ProductRadar
//
// Responsibility
//
// ✓ Specification Experience orchestration
// ✓ Component ordering
// ✓ Product guard
//
// ✗ Specification generation
// ✗ Semantic generation
// ✗ Observation parsing
// ✗ Recommendation generation
//
// ============================================================================

/* ============================================================================
🔥 Components
============================================================================ */

import ProductSpec
  from '../components/spec/ProductSpec'

import ProductCompactSpec
  from '../components/spec/ProductCompactSpec'

import ProductRadar
  from '../components/spec/ProductRadar'


/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedProduct,

} from '@/shared/lib/api/django/pc/product-detail'


/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product:
    ProjectedProduct

}


/* ============================================================================
🔥 Product Specification Section
============================================================================ */

export default function ProductSpecSection({

  product,

}: Props) {

  /* ==========================================================================
  Empty Guard
  ========================================================================== */

  if (!product) {

    return null

  }


  /* ==========================================================================
  Render
  ========================================================================== */

  return (

    <section
      aria-label="製品スペック"
    >

      {/* ======================================================================
      QUICK SPECIFICATION
      ====================================================================== */}

      <ProductCompactSpec

        product={
          product
        }

      />


      {/* ======================================================================
      PRODUCT SPECIFICATION
      ====================================================================== */}

      <ProductSpec

        product={
          product
        }

      />


      {/* ======================================================================
      OBSERVATION
      ====================================================================== */}

      <ProductRadar

        product={
          product
        }

      />

    </section>

  )

}