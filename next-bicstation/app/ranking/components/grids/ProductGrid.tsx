// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/grids/ProductGrid.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import ProductRankingCard
  from '../cards/ProductRankingCard'

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
ProductGrid({

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

    <div
      style={{
        display: 'grid',

        gridTemplateColumns:
          `
            repeat(
              auto-fill,
              minmax(340px,1fr)
            )
          `,

        gap: '24px',
      }}
    >

      {products.map(
        (
          product,
          index
        ) => {

          if (
            !product?.unique_id
          ) {
            return null
          }

          return (

            <ProductRankingCard

              key={
                product.unique_id
                || index
              }

              product={
                product
              }

              index={
                index
              }

            />

          )

        }
      )}

    </div>

  )
}