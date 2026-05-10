// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/sections/ProductTrustSection.tsx

/* =========================================
🔥 Components
========================================= */

import ProductTrustSection
  from '../components/trust/ProductTrustSection'

import ProductForWho
  from '../components/trust/ProductForWho'

import ProductNotForWho
  from '../components/trust/ProductNotForWho'

import ProductDecisionSupport
  from '../components/trust/ProductDecisionSupport'

/* =========================================
🔥 Props
========================================= */

type Props = {

  product: any
}

/* =========================================
🔥 Product Trust Section
========================================= */

export default function
ProductTrustLayer({
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
      {/* Trust Summary */}
      {/* ============================= */}

      <ProductTrustSection
        product={product}
      />

      {/* ============================= */}
      {/* For Who */}
      {/* ============================= */}

      <ProductForWho
        product={product}
      />

      {/* ============================= */}
      {/* Not For Who */}
      {/* ============================= */}

      <ProductNotForWho
        product={product}
      />

      {/* ============================= */}
      {/* Decision Support */}
      {/* ============================= */}

      <ProductDecisionSupport
        product={product}
      />

    </section>

  )
}