// ============================================================================
// FILE:
// /app/product/[unique_id]/section/ProductSemanticSection.tsx
// ============================================================================

/* ============================================================================
🔥 Components
============================================================================ */

import ProductSemanticSummary
  from '../components/semantic/ProductSemanticSummary'

import ProductSemanticReasons
  from '../components/semantic/ProductSemanticReasons'

import ProductSemanticAccordion
  from '../components/semantic/ProductSemanticAccordion'

import ProductWorkflowExperience
  from '../components/workflow/ProductWorkflowExperience'

import ProductMeaningBreakdown
  from '../components/meaning/ProductMeaningBreakdown'

/* ============================================================================
🔥 Types
============================================================================ */

type SemanticReason = {

  slug?: string

  title?: string

  description?: string

  role?: string

  weight?: string | number

}

type RelatedIntent = {

  slug: string

  title: string

  description?: string | null

}

type Props = {

  product: any

  semanticRuntime?: {

    semantic_summary?: string

    semantic_reasons?: SemanticReason[]

    workflow_tags?: string[]

    related_intents?: RelatedIntent[]

    grouped_attributes?: Record<
      string,
      any[]
    >

  }

}

/* ============================================================================
🔥 Product Semantic Section
============================================================================ */

export default function ProductSemanticSection({

  product,

  semanticRuntime,

}: Props) {

  /* ==========================================================================
  Guards
  ========================================================================== */

  if (!product) {

    return null

  }

  if (!semanticRuntime) {

    return null

  }

  /* ==========================================================================
  Render
  ========================================================================== */

  return (

    <section>

      {/* ==========================================================
      Semantic Summary
      ========================================================== */}

      <ProductSemanticSummary
        semanticRuntime={
          semanticRuntime
        }
      />

      {/* ==========================================================
      Why This Product
      ========================================================== */}

      <ProductSemanticReasons
        semanticRuntime={
          semanticRuntime
        }
      />

      {/* ==========================================================
      Workflow Experience
      ========================================================== */}

      <ProductWorkflowExperience
        workflowTags={
          semanticRuntime
            ?.workflow_tags
        }
      />

      {/* ==========================================================
      Meaning Breakdown
      ========================================================== */}

      <ProductMeaningBreakdown
        semanticRuntime={
          semanticRuntime
        }
      />

      {/* ==========================================================
      Semantic Details
      ========================================================== */}

      <ProductSemanticAccordion
        semanticRuntime={
          semanticRuntime
        }
      />

    </section>

  )

}