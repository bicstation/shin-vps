// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/sections/ProductRelatedSection.tsx

/* =========================================
🔥 Components
========================================= */

import ProductRelated
  from '../components/recommendation/ProductRelated'

import ProductSimilarUsage
  from '../components/recommendation/ProductSimilarUsage'

import ProductNextIntent
  from '../components/recommendation/ProductNextIntent'

import RelatedProducts
  from '../components/RelatedProducts'

/* =========================================
🔥 Props
========================================= */

type Props = {

  product: any
}

/* =========================================
🔥 Product Related Section
========================================= */

export default function
ProductRelatedSection({
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
      {/* Related */}
      {/* ============================= */}

      <ProductRelated
        product={product}
      />

      {/* ============================= */}
      {/* Similar Usage */}
      {/* ============================= */}

      <ProductSimilarUsage
        product={product}
      />

      {/* ============================= */}
      {/* Next Intent */}
      {/* ============================= */}

      <ProductNextIntent
        product={product}
      />

      {/* ============================= */}
      {/* Related Products */}
      {/* ============================= */}

      <RelatedProducts
        product={product}
      />

    </section>

  )
}