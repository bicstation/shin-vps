// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/sections/ProductCTASection.tsx

/* =========================================
🔥 Components
========================================= */

import ProductPriceCTA
  from '../components/cta/ProductPriceCTA'

import ProductFinalCTA
  from '../components/cta/ProductFinalCTA'

import ProductStickyCTA
  from '../components/cta/ProductStickyCTA'

import FinalCta
  from '../components/FinalCta'

/* =========================================
🔥 Props
========================================= */

type Props = {

  product: any
}

/* =========================================
🔥 Product CTA Section
========================================= */

export default function
ProductCTASection({
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
      {/* Price CTA */}
      {/* ============================= */}

      <ProductPriceCTA
        product={product}
      />

      {/* ============================= */}
      {/* Final CTA */}
      {/* ============================= */}

      <ProductFinalCTA
        product={product}
      />

      {/* ============================= */}
      {/* Sticky CTA */}
      {/* ============================= */}

      <ProductStickyCTA
        product={product}
      />

      {/* ============================= */}
      {/* Legacy Final CTA */}
      {/* ============================= */}

      <FinalCta
        product={product}
      />

    </section>

  )
}