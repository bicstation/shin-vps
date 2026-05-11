// /app/product/[unique_id]/sections/ProductSemanticSection.tsx

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
}

/* =========================================
🔥 Product Semantic Section
========================================= */

export default function
ProductSemanticSection({
  product,
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

  const grouped =

    product
      ?.grouped_attributes
      || {}

  const hasSemantic =

    Object.keys(
      grouped
    ).length > 0

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
        product={product}
      />

      {/* ============================= */}
      {/* Reasons */}
      {/* ============================= */}

      <ProductSemanticReasons
        product={product}
      />

      {/* ============================= */}
      {/* Accordion */}
      {/* ============================= */}

      <ProductSemanticAccordion
        product={product}
      />

    </section>

  )
}