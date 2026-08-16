// ============================================================================
// FILE:
// app/product/[unique_id]/section/ProductHeroSection.tsx
//
// SHIN CORE LINX
// Product Detail Hero Experience
//
// RESPONSIBILITY
//
// Product Detail Runtime
//        ↓
// ProductHeroSection
//        ↓
// ┌──────────────────────────────┐
// │ ProductHero                  │
// │ Product Identity             │
// ├──────────────────────────────┤
// │ ProductAISummary             │
// │ Semantic Understanding       │
// ├──────────────────────────────┤
// │ ProductHeroCapability        │
// │ Workflow / Recommendation    │
// └──────────────────────────────┘
//
// ProductHeroSection = Experience Orchestrator
//
// ✓ Controls section order
// ✓ Passes Runtime data to responsible components
// ✓ Does not generate semantic meaning
// ✓ Does not transform Product Reality
//
// ============================================================================

/* ============================================================================
🔥 Components
============================================================================ */

import ProductHero
  from '../components/hero/ProductHero'

import ProductAISummary
  from '../components/hero/ProductAISummary'

import ProductHeroCapability
  from '../components/hero/ProductHeroCapability'

/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedProduct,
  ProjectedSemanticRuntime,
  ProjectedCompiledRuntime,

} from '@/shared/lib/api/django/pc/product-detail'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product:
    ProjectedProduct

  semanticRuntime?:
    ProjectedSemanticRuntime

  compiledRuntime?:
    ProjectedCompiledRuntime

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductHeroSection({

  product,

  semanticRuntime,

  compiledRuntime,

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

    <>

      {/* ======================================================================
      01 — PRODUCT IDENTITY
      ====================================================================== */}

      <ProductHero

        product={
          product
        }

      />

      {/* ======================================================================
      02 — PRODUCT UNDERSTANDING
      ====================================================================== */}

      <ProductAISummary

        product={ product }
        semanticRuntime={ semanticRuntime }

      />

      {/* ======================================================================
      03 — PRODUCT CAPABILITY
      ====================================================================== */}

      <ProductHeroCapability

        product={ product }
        semanticRuntime={ semanticRuntime }

      />

    </>

  )

}