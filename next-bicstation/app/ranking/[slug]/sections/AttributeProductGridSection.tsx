// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/sections/AttributeProductGridSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import ProductGrid
  from '../../components/grids/ProductGrid'

import SectionHeading
  from '../../components/ui/SectionHeading'

/* =========================================
🔥 Types
========================================= */

type Props = {

  products?: any[]
}

/* =========================================
🔥 Component
========================================= */

export default function
AttributeProductGridSection({

  products = [],

}: Props) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    !Array.isArray(products)
    || !products.length
  ) {
    return null
  }

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <section
      style={{
        display: 'grid',

        gap: '40px',
      }}
    >

      {/* ==================================
      HEADING
      ================================== */}

      <SectionHeading

        eyebrow="semantic ranking"

        title="Top Ranking Products"

        description={`
semantic runtime ranking に基づく
product list を表示しています。
`}

      />

      {/* ==================================
      PRODUCT GRID
      ================================== */}

      <ProductGrid
        products={products}
      />

    </section>

  )
}