// ============================================================================
// FILE:
// /app/discover/[semantic-slug]/components/FeaturedProduct.tsx
// ============================================================================

'use client'

import Link
  from 'next/link'

import styles
  from '../styles/discover-detail.module.css'

type Props = {

  product: any

}

export default function FeaturedProduct({

  product,

}: Props) {

  if (!product) {

    return null

  }

  return (

    <section
      className={
        styles.featuredSection
      }
    >

      <div
        className={
          styles.featuredBadge
        }
      >
        🏆 Featured Product
      </div>

      <div
        className={
          styles.featuredCard
        }
      >

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
                styles.featuredImage
              }
            />

          )

        }

        <div
          className={
            styles.featuredContent
          }
        >

          <h2
            className={
              styles.featuredTitle
            }
          >
            {product.name}
          </h2>

          <p
            className={
              styles.featuredMaker
            }
          >
            {product.maker}
          </p>

          <div
            className={
              styles.featuredPrice
            }
          >

            ¥

            {

              Number(
                product.price || 0
              ).toLocaleString()

            }

          </div>

          <Link

            href={
              `/product/${product.unique_id}`
            }

            className={
              styles.featuredButton
            }

          >
            詳細を見る
          </Link>

        </div>

      </div>

    </section>

  )

}