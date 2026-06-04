// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/sections/ProductRelatedSection.tsx
// ============================================================================

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
from '../components/recommendation/RelatedProducts'

/* =========================================
🔥 Props
========================================= */

type Props = {

product: any

related: any[]
}

/* =========================================
🔥 Product Related Section
========================================= */

export default function
ProductRelatedSection({

product,

related,

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
  {/* Related Narrative */}
  {/* ============================= */}

  <ProductRelated
    product={product}
    related={related}
  />

  {/* ============================= */}
  {/* Similar Workflow */}
  {/* ============================= */}

  <ProductSimilarUsage
    product={product}
    related={related}
  />

  {/* ============================= */}
  {/* Next Intent */}
  {/* ============================= */}

  <ProductNextIntent
    product={product}
    related={related}
  />

  {/* ============================= */}
  {/* Exploration Slider */}
  {/* ============================= */}

  <RelatedProducts
    related={related}
  />

</section>


)
}
