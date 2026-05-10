// /home/maya/shin-dev/shin-vps/shared/components/organisms/cards/HeroRankingCard.tsx

/* eslint-disable @next/next/no-img-element */

import Link
  from 'next/link'

import styles
  from './HeroRankingCard.module.css'

type Props = {
  product: any
}

export default function HeroRankingCard({
  product,
}: Props) {

  // =====================================
  // Semantic Tags
  // =====================================

  const tags = [

    product?.gpu_model,

    product?.cpu_model,

    product?.memory_gb
      ? `${product.memory_gb}GB`
      : null,

    product?.storage_gb
      ? `${product.storage_gb}GB SSD`
      : null,

  ].filter(Boolean)

  // =====================================
  // Price
  // =====================================

  const price =

    product?.price

      ? `¥${Number(
          product.price
        ).toLocaleString()}`

      : '価格未設定'

  // =====================================
  // AI Summary
  // =====================================

  const summary =

    product?.ai_summary
      || 'FPSゲーム・AI画像生成・動画編集まで快適に対応できる高性能モデルです。'

  // =====================================
  // Render
  // =====================================

  return (

    <article
      className={
        styles.card
      }
    >

      {/* ============================== */}
      {/* Left */}
      {/* ============================== */}

      <div
        className={
          styles.left
        }
      >

        {/* ============================ */}
        {/* Top Label */}
        {/* ============================ */}

        <div
          className={
            styles.topRow
          }
        >

          <div
            className={
              styles.rankBadge
            }
          >
            RANK #1
          </div>

          <div
            className={
              styles.recommendBadge
            }
          >
            AIおすすめ
          </div>

        </div>

        {/* ============================ */}
        {/* Title */}
        {/* ============================ */}

        <h2
          className={
            styles.title
          }
        >

          {product?.name}

        </h2>

        {/* ============================ */}
        {/* Maker */}
        {/* ============================ */}

        <div
          className={
            styles.maker
          }
        >

          {product?.maker}

        </div>

        {/* ============================ */}
        {/* Description */}
        {/* ============================ */}

        <div
          className={
            styles.description
          }
        >

          {summary}

        </div>

        {/* ============================ */}
        {/* Tags */}
        {/* ============================ */}

        <div
          className={
            styles.tags
          }
        >

          {tags.map((tag) => (

            <div
              key={tag}

              className={
                styles.tag
              }
            >

              {tag}

            </div>

          ))}

        </div>

        {/* ============================ */}
        {/* Price */}
        {/* ============================ */}

        <div
          className={
            styles.price
          }
        >

          {price}

        </div>

        {/* ============================ */}
        {/* CTA */}
        {/* ============================ */}

        <div
          className={
            styles.actions
          }
        >

          <Link
            href={
              `/product/${product?.unique_id}`
            }

            className={
              styles.primaryButton
            }
          >

            詳細を見る

          </Link>

          <button
            className={
              styles.secondaryButton
            }
          >

            比較する

          </button>

        </div>

      </div>

      {/* ============================== */}
      {/* Right */}
      {/* ============================== */}

      <div
        className={
          styles.right
        }
      >

        {product?.image_url && (

          <img
            src={
              product.image_url
            }

            alt={
              product?.name
            }

            className={
              styles.image
            }
          />

        )}

      </div>

    </article>

  )
}