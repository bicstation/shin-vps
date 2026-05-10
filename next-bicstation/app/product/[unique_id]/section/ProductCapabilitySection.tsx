// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/sections/ProductCapabilitySection.tsx

/* =========================================
🔥 Components
========================================= */

import ProductCapability
  from '../components/capability/ProductCapability'

import ProductPerformanceHighlights
  from '../components/capability/ProductPerformanceHighlights'

import ProductUsageExamples
  from '../components/capability/ProductUsageExamples'

/* =========================================
🔥 Props
========================================= */

type Props = {

  product: any
}

/* =========================================
🔥 Product Capability Section
========================================= */

export default function
ProductCapabilitySection({
  product,
}: Props) {

  // ======================================
  // Empty Guard
  // ======================================

  if (!product) {

    return null

  }

  // ======================================
  // Render
  // ======================================

  return (

    <section>

      {/* ============================= */}
      {/* Capability */}
      {/* ============================= */}

      <ProductCapability
        product={product}
      />

      {/* ============================= */}
      {/* Performance Highlights */}
      {/* ============================= */}

      <ProductPerformanceHighlights
        product={product}
      />

      {/* ============================= */}
      {/* Usage Examples */}
      {/* ============================= */}

      <ProductUsageExamples
        product={product}
      />

    </section>

  )
}