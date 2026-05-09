// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/components/RankingCard.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link
  from 'next/link'

import styles
  from './RankingCard.module.css'

/* =========================================
🔥 Utils
========================================= */

import {
  formatPrice,
  formatScore,
  getRankBadge,
  resolveProductImage,
} from '../utils/ranking-ui'

/* =========================================
🔥 Types
========================================= */

import type {
  RankingProduct,
} from '../types/ranking'

type Props = {

  product: RankingProduct

  rank?: number
}

/* =========================================
🔥 Component
========================================= */

export default function
RankingCard({
  product,
  rank = 1,
}: Props) {

  // ======================================
  // Safe Values
  // ======================================

  const image =
    resolveProductImage(
      product?.image_url
    )

  const price =
    formatPrice(
      product?.price
    )

  const score =
    formatScore(
      product?.score
    )

  const badge =
    getRankBadge(rank)

  const href =
    `/pc/${product?.slug || product?.unique_id}`

  return (

    <article
      className={
        styles.card
      }
    >

      {/* ==================================
      IMAGE
      ================================== */}

      <Link
        href={href}

        className={
          styles.imageLink
        }
      >

        <div
          className={
            styles.imageWrap
          }
        >

          <img
            src={image}

            alt={
              product?.name
              || 'PC'
            }

            className={
              styles.image
            }
          />

          {/* =============================
          RANK BADGE
          ============================= */}

          <div
            className={
              styles.rankBadge
            }
          >
            {badge}
          </div>

        </div>

      </Link>

      {/* ==================================
      BODY
      ================================== */}

      <div
        className={
          styles.body
        }
      >

        {/* =============================
        PRODUCT NAME
        ============================= */}

        <Link
          href={href}

          className={
            styles.titleLink
          }
        >

          <h3
            className={
              styles.title
            }
          >
            {product?.name}
          </h3>

        </Link>

        {/* =============================
        MAKER
        ============================= */}

        {!!product?.maker && (

          <div
            className={
              styles.maker
            }
          >
            {product.maker}
          </div>

        )}

        {/* =============================
        META
        ============================= */}

        <div
          className={
            styles.meta
          }
        >

          <div
            className={
              styles.price
            }
          >
            {price}
          </div>

          <div
            className={
              styles.score
            }
          >
            Score {score}
          </div>

        </div>

      </div>

    </article>

  )
}
