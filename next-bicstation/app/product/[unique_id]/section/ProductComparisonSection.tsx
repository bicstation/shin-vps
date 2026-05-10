// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/sections/ProductComparisonSection.tsx

/* =========================================
🔥 Components
========================================= */

import ProductAlternativeList
  from '../components/comparison/ProductAlternativeList'

import ProductBetterChoiceGuide
  from '../components/comparison/ProductBetterChoiceGuide'

import ProductComparisonLinks
  from '../components/comparison/ProductComparisonLinks'

/* =========================================
🔥 Props
========================================= */

type Props = {

  product: any
}

/* =========================================
🔥 Product Comparison Section
========================================= */

export default function
ProductComparisonSection({
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
      {/* Better Choice Guide */}
      {/* ============================= */}

      <ProductBetterChoiceGuide
        product={product}
      />

      {/* ============================= */}
      {/* Alternative List */}
      {/* ============================= */}

      <ProductAlternativeList
        product={product}
      />

      {/* ============================= */}
      {/* Comparison Links */}
      {/* ============================= */}

      <ProductComparisonLinks
        product={product}
      />

    </section>

  )
}