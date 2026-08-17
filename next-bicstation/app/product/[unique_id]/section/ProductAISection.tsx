// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/[unique_id]/section/ProductAISection.tsx
// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/[unique_id]/section/ProductAISection.tsx
//
// SHIN CORE LINX
// Product Detail AI Summary Section
//
// RESPONSIBILITY
//
// Product Detail Runtime
//        ↓
// ProductAISection
//        ↓
// ProductAISummary
//
// ProductAISection = Experience Orchestrator
//
// ✓ Controls AI Summary section placement
// ✓ Passes Product Runtime data
// ✓ Reuses existing ProductAISummary
//
// ✗ Does not generate semantic meaning
// ✗ Does not transform Product Reality
// ✗ Does not generate AI summary
// ✗ Does not infer workflow
// ✗ Does not generate recommendations
//
// ============================================================================


/* ============================================================================
🔥 Components
============================================================================ */

import ProductAISummary
  from '../components/hero/ProductAISummary'


/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedProduct,
  ProjectedSemanticRuntime,

} from '@/shared/lib/api/django/pc/product-detail'


/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product:
    ProjectedProduct

  semanticRuntime?:
    ProjectedSemanticRuntime

}


/* ============================================================================
🔥 Product AI Section
============================================================================ */

export default function ProductAISection({

  product,

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
      PRODUCT AI SUMMARY
      ====================================================================== */}

      <ProductAISummary

        product={
          product
        }

        semanticRuntime={
          semanticRuntime
        }

      />

    </section>

  )

}