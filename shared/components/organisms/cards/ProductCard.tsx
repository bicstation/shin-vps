// /home/maya/shin-dev/shin-vps/shared/components/organisms/cards/ProductCard.tsx

/* eslint-disable @next/next/no-img-element */

import Link
  from 'next/link'

import styles
  from './ProductCard.module.css'

type Props = {
  product: any
}

export default function ProductCard({
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
  // Render
  // =====================================

  return (

    <article
      className={
        styles.card
      }
    >

      {/* ============================== */}
      {/* Image */}
      {/* ============================== */}

      <div
        className={
          styles.imageWrap
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

      {/* ============================== */}
      {/* Content */}
      {/* ============================== */}

      <div
        className={
          styles.content
        }
      >

        {/* ============================ */}
        {/* Label */}
        {/* ============================ */}

        <div
          className={
            styles.label
          }
        >

          SEMANTIC RECOMMENDATION

        </div>

        {/* ============================ */}
        {/* Title */}
        {/* ============================ */}

        <h3
          className={
            styles.title
          }
        >

          {product?.name}

        </h3>

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
        {/* Description */}
        {/* ============================ */}

        <div
          className={
            styles.description
          }
        >

          AI画像生成・FPSゲーム・
          動画編集など、
          高性能用途にも対応できる
          バランス構成です。

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

            比較

          </button>

        </div>

      </div>

    </article>

  )
}