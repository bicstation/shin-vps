// ============================================================================
// FILE:
// /app/product/[unique_id]/section/ProductSemanticSection.tsx
// ============================================================================

/* =========================================
🔥 Components
========================================= */

import ProductSemanticSummary
  from '../components/semantic/ProductSemanticSummary'

import ProductSemanticReasons
  from '../components/semantic/ProductSemanticReasons'

import ProductSemanticAccordion
  from '../components/semantic/ProductSemanticAccordion'

/* =========================================
🔥 Props
========================================= */

type Props = {

  product: any

  semanticRuntime?: {
    semantic_summary?: string
    semantic_reasons?: string[]
    related_intents?: string[]
    grouped_attributes?: Record<
      string,
      any
    >
  }
}

/* =========================================
🔥 Product Semantic Section
========================================= */

export default function
ProductSemanticSection({

  product,

  semanticRuntime,

}: Props) {

  // ======================================
  // Empty Guard
  // ======================================

  if (!product) {

    return null
  }

  // ======================================
  // Semantic Guard
  // ======================================

  const hasSemantic =

    !!semanticRuntime

  if (!hasSemantic) {

    return null
  }

  // ======================================
  // Render
  // ======================================

  return (

    <section>

      {/* ============================= */}
      {/* Summary */}
      {/* ============================= */}

      <ProductSemanticSummary
        semanticRuntime={
          semanticRuntime
        }
      />

      {/* ============================= */}
      {/* Reasons */}
      {/* ============================= */}

      <ProductSemanticReasons
        semanticRuntime={
          semanticRuntime
        }
      />

      {/* ============================= */}
      {/* Accordion */}
      {/* ============================= */}

      <ProductSemanticAccordion
        semanticRuntime={
          semanticRuntime
        }
      />

    </section>

  )
}