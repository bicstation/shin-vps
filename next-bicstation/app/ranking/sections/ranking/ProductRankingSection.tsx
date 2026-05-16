// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/sections/ranking/ProductRankingSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import ProductGrid
  from '../../components/grids/ProductGrid'

/* =========================================
🔥 UI
========================================= */

import SectionHeading
  from '../../components/ui/SectionHeading'

import SectionDescription
  from '../../components/ui/SectionDescription'

/* =========================================
🔥 Types
========================================= */

type Props = {

  products?: any[]
}

/* =========================================
🔥 Section
========================================= */

export default function
ProductRankingSection({

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
  🔥 Count
  ====================================== */

  const totalProducts =

    products.length

  /* ======================================
  🔥 Top Product
  ====================================== */

  const topProduct =

    products?.[0]

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <section
      style={{
        display: 'grid',

        gap: '28px',
      }}
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div>

        {/* ==============================
        LABEL
        ============================== */}

        <div
          style={{
            fontSize: '12px',

            fontWeight: 700,

            letterSpacing: '0.12em',

            textTransform:
              'uppercase',

            opacity: 0.45,

            marginBottom: '10px',
          }}
        >
          semantic ranking
        </div>

        {/* ==============================
        TITLE
        ============================== */}

        <SectionHeading>

          おすすめPCランキング

        </SectionHeading>

        {/* ==============================
        DESCRIPTION
        ============================== */}

        <SectionDescription>

          semantic runtime に基づいて
          ranking された
          {totalProducts}
          件の
          product を表示しています。

          {!!topProduct?.name && (

            <>
              {' '}
              現在の top ranking は
              「{topProduct.name}」
              です。
            </>

          )}

        </SectionDescription>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <ProductGrid

        products={products}

      />

    </section>

  )
}