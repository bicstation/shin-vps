// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/sections/ProductSpecSection.tsx

/* =========================================
🔥 Components
========================================= */

import ProductSpec
  from '../components/spec/ProductSpec'

import ProductCompactSpec
  from '../components/spec/ProductCompactSpec'

import ProductRadar
  from '../components/spec/ProductRadar'

/* =========================================
🔥 Props
========================================= */

type Props = {

  product: any
}

/* =========================================
🔥 Product Spec Section
========================================= */

export default function
ProductSpecSection({
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
      {/* Compact Spec */}
      {/* ============================= */}

      {/* <ProductCompactSpec
        product={product}
      /> */}

      {/* ============================= */}
      {/* Main Spec */}
      {/* ============================= */}

      {/* <ProductSpec
        product={product}
      /> */}

      {/* ============================= */}
      {/* Radar */}
      {/* ============================= */}

      {/* <ProductRadar
        product={product}
      /> */}

    </section>

  )
}