// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/components/RankingGrid.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import ProductCard
  from '@/shared/components/organisms/cards/ProductCard'

import styles
  from './RankingGrid.module.css'

/* =========================================
🔥 Types
========================================= */

type Props = {

  products: any[]
}

/* =========================================
🔥 Component
========================================= */

export default function
RankingGrid({
  products,
}: Props) {

  // ======================================
  // Empty
  // ======================================

  if (!products?.length) {
    return null
  }

  // ======================================
  // Compare Products
  // ======================================

  const compareProducts =
    products.slice(0, 12)

  return (

    <div
      className={
        styles.grid
      }
    >

      {compareProducts.map((

        product,
        index

      ) => {

        // --------------------------------
        // Guard
        // --------------------------------

        if (
          !product?.unique_id
        ) {
          return null
        }

        return (

          <ProductCard
            key={
              product.unique_id
            }

            product={
              product
            }

            rank={
              index + 1
            }
          />

        )

      })}

    </div>

  )
}