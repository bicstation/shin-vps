// ============================================================================
// FILE:
// /app/discover/[semantic-slug]/components/ProductCard.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Link
  from 'next/link'

/* ============================================================================
🔥 Runtime
============================================================================ */

import type {

  DiscoverDetailProduct,

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

  product:
    DiscoverDetailProduct

}

/* ============================================================================
🔥 Product Card
============================================================================ */

export default function ProductCard({

  product,

}: Props) {

  return (

    <Link

      href={
        `/product/${product.unique_id}`
      }

      className={
        styles.productCard
      }

    >

      {/* ==========================================================
      IMAGE
      ========================================================== */}

      {

        product.image_url && (

          <img

            src={
              product.image_url
            }

            alt={
              product.name
            }

            className={
              styles.productImage
            }

          />

        )

      }

      {/* ==========================================================
      CONTENT
      ========================================================== */}

      <div
        className={
          styles.productContent
        }
      >

        <h3
          className={
            styles.productName
          }
        >

          {

            product.name

          }

        </h3>

        {

          product.maker && (

            <p
              className={
                styles.productMaker
              }
            >

              {

                product.maker

              }

            </p>

          )

        }

        {

          product.price !== undefined && (

            <p
              className={
                styles.productPrice
              }
            >

              ¥

              {

                product.price.toLocaleString()

              }

            </p>

          )

        }

      </div>

    </Link>

  )

}