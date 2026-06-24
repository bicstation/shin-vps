// ============================================================================
// FILE:
// /app/discover/[semantic-slug]/components/RepresentativeProducts.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Components
============================================================================ */

import ProductCard
  from './ProductCard'

/* ============================================================================
🔥 Runtime
============================================================================ */

import type {

  DiscoverDetailRuntime,

} from '@/shared/lib/api/django/pc/discover-detail'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from '../styles/discover-detail.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  runtime:
    DiscoverDetailRuntime

}

/* ============================================================================
🔥 Representative Products
============================================================================ */

export default function RepresentativeProducts({

  runtime,

}: Props) {

  const products =

    runtime.sample_products
      .slice(0, 3)

  if (
    products.length === 0
  ) {
    return null
  }

  return (

    <section
      className={
        styles.representativeSection
      }
    >

      <div
        className={
          styles.sectionHeader
        }
      >

        <h2
          className={
            styles.sectionTitle
          }
        >

          この世界を代表するPC

        </h2>

        <p
          className={
            styles.sectionDescription
          }
        >

          まず確認したい代表的なモデル

        </p>

      </div>

      <div
        className={
          styles.productGrid
        }
      >

        {products.map(

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

        )}

      </div>

    </section>

  )

}