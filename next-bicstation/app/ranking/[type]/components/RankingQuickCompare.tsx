// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/components/RankingQuickCompare.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './RankingQuickCompare.module.css'

/* =========================================
🔥 Utils
========================================= */

import {
  formatPrice,
  formatScore,
} from '../utils/ranking-ui'

/* =========================================
🔥 Types
========================================= */

import type {
  RankingProduct,
} from '../types/ranking'

type Props = {

  products:
    RankingProduct[]
}

/* =========================================
🔥 Component
========================================= */

export default function
RankingQuickCompare({
  products,
}: Props) {

  // ======================================
  // Empty
  // ======================================

  if (
    !products?.length
  ) {
    return null
  }

  // ======================================
  // Compare Products
  // ======================================

  const compareProducts =
    products.slice(0, 5)

  return (

    <div
      className={
        styles.wrapper
      }
    >

      <div
        className={
          styles.table
        }
      >

        {/* =================================
        HEADER
        ================================= */}

        <div
          className={
            styles.rowHeader
          }
        >

          <div
            className={
              styles.headerCell
            }
          >
            モデル
          </div>

          <div
            className={
              styles.headerCell
            }
          >
            メーカー
          </div>

          <div
            className={
              styles.headerCell
            }
          >
            価格
          </div>

          <div
            className={
              styles.headerCell
            }
          >
            Score
          </div>

        </div>

        {/* =================================
        ROWS
        ================================= */}

        {compareProducts.map(
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

              <div
                key={
                  product.unique_id
                }

                className={
                  styles.row
                }
              >

                {/* =========================
                MODEL
                ========================= */}

                <div
                  className={
                    styles.modelCell
                  }
                >

                  <span
                    className={
                      styles.rank
                    }
                  >
                    #{index + 1}
                  </span>

                  <span
                    className={
                      styles.model
                    }
                  >
                    {
                      product?.name
                    }
                  </span>

                </div>

                {/* =========================
                MAKER
                ========================= */}

                <div
                  className={
                    styles.cell
                  }
                >
                  {
                    product?.maker
                    || '-'
                  }
                </div>

                {/* =========================
                PRICE
                ========================= */}

                <div
                  className={
                    styles.price
                  }
                >
                  {
                    formatPrice(
                      product?.price
                    )
                  }
                </div>

                {/* =========================
                SCORE
                ========================= */}

                <div
                  className={
                    styles.score
                  }
                >
                  Score {
                    formatScore(
                      product?.score
                    )
                  }
                </div>

              </div>

            )
          }
        )}

      </div>

    </div>

  )
}

