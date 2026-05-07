'use client'

import Link from 'next/link'

import SemanticBadge from '@/shared/components/semantic/SemanticBadge'

import styles from './ProductCard.module.css'

/**
 * =========================================
 * 🔥 Types
 * =========================================
 */

type SemanticAttribute = {
  slug: string
  name: string
  type: string

  semantic_role?: string
  semantic_weight?: number
}

type Product = {
  id: number

  unique_id: string

  name?: string
  shortTitle?: string

  image_url?: string

  price?: number

  gpu_model?: string
  cpu_model?: string

  semantic_confidence?: number

  semantic_reason?: string[]

  attributes?: SemanticAttribute[]

  grouped_attributes?: Record<
    string,
    SemanticAttribute[]
  >
}

type Props = {
  product?: Product
  rank?: number
}

/**
 * =========================================
 * 🔥 Rank Label
 * =========================================
 */

function getRankLabel(rank?: number) {
  if (!rank) return null

  if (rank === 1) {
    return '👑 人気No.1'
  }

  if (rank === 2) {
    return '🔥 人気急上昇'
  }

  if (rank === 3) {
    return '⚖️ バランス良'
  }

  if (rank <= 10) {
    return `TOP ${rank}`
  }

  return null
}

/**
 * =========================================
 * 🔥 Utils
 * =========================================
 */

function truncate(
  text?: string,
  length: number = 46
) {
  if (!text) {
    return 'おすすめ商品'
  }

  return text.length > length
    ? `${text.slice(0, length)}...`
    : text
}

function formatPrice(price?: number) {
  if (typeof price !== 'number') {
    return null
  }

  return `¥${price.toLocaleString()}`
}

/**
 * =========================================
 * 🔥 Component
 * =========================================
 */

export default function ProductCard({
  product,
  rank,
}: Props) {

  // --------------------------------
  // Empty
  // --------------------------------
  if (!product) return null

  // --------------------------------
  // Basic
  // --------------------------------
  const title = truncate(
    product.shortTitle || product.name
  )

  const image =
    product.image_url || '/no-image.png'

  const price = formatPrice(product.price)

  const label = getRankLabel(rank)

  // --------------------------------
  // Semantic
  // --------------------------------
  const attributes =
    product.attributes ?? []

  const groupedAttributes =
    product.grouped_attributes ?? {}

  const semanticReasons =
    product.semantic_reason ?? []

  const confidence =
    product.semantic_confidence ?? 88

  // --------------------------------
  // emphasis
  // --------------------------------
  const emphasisAttributes =
    attributes
      .filter(
        (attr) =>
          attr.semantic_role ===
            'highlight' ||
          (attr.semantic_weight ?? 0) >= 80
      )
      .slice(0, 3)

  return (
    <Link
      href={`/product/${product.unique_id}`}
      className={styles.card}
    >

      {/* ============================== */}
      {/* image */}
      {/* ============================== */}

      <div className={styles.imageWrap}>

        <img
          src={image}
          alt={title}
          className={styles.image}
          loading="lazy"
        />

        <div className={styles.imageGrad} />

        {/* ranking */}
        {label && (
          <div className={styles.label}>
            {label}
          </div>
        )}

        {/* confidence */}
        <div className={styles.confidence}>
          {confidence}%
        </div>

      </div>

      {/* ============================== */}
      {/* semantic emphasis */}
      {/* ============================== */}

      {emphasisAttributes.length >
        0 && (
        <div className={styles.semanticTop}>

          {emphasisAttributes.map(
            (attr) => (
              <SemanticBadge
                key={`${attr.type}-${attr.slug}`}
                attribute={attr}
              />
            )
          )}

        </div>
      )}

      {/* ============================== */}
      {/* price */}
      {/* ============================== */}

      {price && (
        <div className={styles.price}>
          {price}
          <span className={styles.tax}>
            税込
          </span>
        </div>
      )}

      {/* ============================== */}
      {/* title */}
      {/* ============================== */}

      <h3 className={styles.title}>
        {title}
      </h3>

      {/* ============================== */}
      {/* semantic reasons */}
      {/* ============================== */}

      {semanticReasons.length > 0 && (
        <div className={styles.reasonBox}>

          {semanticReasons
            .slice(0, 3)
            .map((reason, index) => (
              <div
                key={index}
                className={styles.reason}
              >
                ✓ {reason}
              </div>
            ))}

        </div>
      )}

      {/* ============================== */}
      {/* grouped semantic */}
      {/* ============================== */}

      {Object.keys(groupedAttributes)
        .length > 0 && (
        <div className={styles.groupedArea}>

          {Object.entries(
            groupedAttributes
          )
            .slice(0, 2)
            .map(
              ([group, attrs]) => (
                <div
                  key={group}
                  className={
                    styles.groupBlock
                  }
                >

                  <span
                    className={
                      styles.groupTitle
                    }
                  >
                    {group}
                  </span>

                  <div
                    className={
                      styles.groupValues
                    }
                  >

                    {attrs
                      ?.slice(0, 2)
                      ?.map((attr) => (
                        <SemanticBadge
                          key={
                            attr.slug
                          }
                          attribute={
                            attr
                          }
                        />
                      ))}

                  </div>

                </div>
              )
            )}

        </div>
      )}

      {/* ============================== */}
      {/* fallback */}
      {/* ============================== */}

      {Object.keys(groupedAttributes)
        .length === 0 &&
        attributes.length > 0 && (
          <div className={styles.spec}>

            {attributes
              .slice(0, 3)
              .map((attr) => (
                <SemanticBadge
                  key={attr.slug}
                  attribute={attr}
                />
              ))}

          </div>
        )}

      {/* ============================== */}
      {/* CTA */}
      {/* ============================== */}

      <div className={styles.cta}>

        <span>
          →
          詳細を見る
        </span>

      </div>

    </Link>
  )
}