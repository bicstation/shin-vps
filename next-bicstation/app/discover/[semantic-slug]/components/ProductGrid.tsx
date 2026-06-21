// ============================================================================
// FILE:
// /app/discover/[semantic-slug]/components/ProductGrid.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Runtime
============================================================================ */

import type {

  DiscoverDetailProduct,

} from '@/shared/lib/api/django/pc/discover-detail'

/* ============================================================================
🔥 Components
============================================================================ */

import ProductCard
  from './ProductCard'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from '../styles/discover-detail.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  products:
    DiscoverDetailProduct[]

}

/* ============================================================================
🔥 Product Grid
============================================================================ */

export default function ProductGrid({

  products,

}: Props) {

  if (

    !products ||

    products.length === 0

  ) {

    return null

  }

  return (

    <section
      className={
        styles.productSection
      }
    >

      <h2
        className={
          styles.sectionTitle
        }
      >

        Products

      </h2>

      <div
        className={
          styles.productGrid
        }
      >

        {

          products.map(

            (product) => (

              <ProductCard

                key={
                  product.unique_id
                }

                product={
                  product
                }

              />

            )

          )

        }

      </div>

    </section>

  )

}