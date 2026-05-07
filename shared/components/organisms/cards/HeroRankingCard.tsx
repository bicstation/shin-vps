'use client'

import Link from 'next/link'

import SemanticSection from '@/shared/components/semantic/SemanticSection'

import {
  semanticHeroCopy,
} from '@/shared/lib/semantic/semanticHeroCopy'

import styles from './HeroRankingCard.module.css'

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

/**
 * =========================================
 * 🔥 Utils
 * =========================================
 */

function truncate(
  text?: string,
  length: number = 50
) {
  if (!text) return 'おすすめ商品'

  return text.length > length
    ? `${text.slice(0, length)}...`
    : text
}

function formatPrice(price?: number) {
  if (typeof price !== 'number') {
    return null
  }

  return price.toLocaleString()
}

/**
 * =========================================
 * 🔥 Component
 * =========================================
 */

export default function HeroRankingCard({
  product,
}: {
  product?: Product
}) {

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

  // --------------------------------
  // Semantic
  // --------------------------------
  const attributes =
    product.attributes ?? []

  const groupedAttributes =
    product.grouped_attributes ?? {}

  const usageAttribute =
    attributes.find(
      (attr) => attr.type === 'usage'
    )

  const usage =
    usageAttribute?.slug || 'default'

  // --------------------------------
  // Hero Copy
  // --------------------------------
  const heroCopy =
    semanticHeroCopy[
      usage as keyof typeof semanticHeroCopy
    ] || semanticHeroCopy.default

  // --------------------------------
  // Semantic Emphasis
  // --------------------------------
  const emphasisAttributes =
    attributes
      .filter(
        (attr) =>
          attr.semantic_role ===
            'highlight' ||
          (attr.semantic_weight ?? 0) >= 80
      )
      .slice(0, 4)

  // --------------------------------
  // Semantic Confidence
  // --------------------------------
  const confidence =
    product.semantic_confidence ?? 92

  return (
    <section className={styles.card}>

      {/* ============================== */}
      {/* semantic emphasis */}
      {/* ============================== */}

      {emphasisAttributes.length > 0 && (
        <div className={styles.semanticTop}>

          {emphasisAttributes.map(
            (attr) => (
              <span
                key={`${attr.type}-${attr.slug}`}
                className={
                  styles.semanticBadge
                }
              >
                {attr.name}
              </span>
            )
          )}

        </div>
      )}

      {/* ============================== */}
      {/* semantic confidence */}
      {/* ============================== */}

      <div className={styles.confidenceBox}>

        <span className={styles.confidenceLabel}>
          おすすめ一致度
        </span>

        <strong
          className={styles.confidenceValue}
        >
          {confidence}%
        </strong>

      </div>

      {/* ============================== */}
      {/* price */}
      {/* ============================== */}

      {price && (
        <div className={styles.price}>
          ¥{price}
          （税込・送料無料）
        </div>
      )}

      {/* ============================== */}
      {/* hero copy */}
      {/* ============================== */}

      <h2 className={styles.catch}>
        {heroCopy.catch}
      </h2>

      <p className={styles.notice}>
        {heroCopy.sub}
      </p>

      {/* ============================== */}
      {/* semantic reason */}
      {/* ============================== */}

      {product.semantic_reason &&
        product.semantic_reason.length >
          0 && (
          <div className={styles.reasonBox}>

            {product.semantic_reason.map(
              (
                reason,
                index
              ) => (
                <div
                  key={index}
                  className={
                    styles.reasonItem
                  }
                >
                  ✓ {reason}
                </div>
              )
            )}

          </div>
        )}

      {/* ============================== */}
      {/* CTA */}
      {/* ============================== */}

      <div className={styles.ctaArea}>

        <Link
          href={`/product/${product.unique_id}`}
          className={styles.cta}
        >
          👉 詳細を見る
        </Link>

        {product?.unique_id && (
          <Link
            href={`/ranking/${usage}`}
            className={styles.subCta}
          >
            →
            同じ用途のPCを見る
          </Link>
        )}

      </div>

      {/* ============================== */}
      {/* notice */}
      {/* ============================== */}

      <p className={styles.noticeSub}>
        ※価格・在庫は変動する場合があります
      </p>

      {/* ============================== */}
      {/* image */}
      {/* ============================== */}

      <div className={styles.imageWrapper}>

        <div className={styles.imageLabel}>
          実際の外観
        </div>

        <img
          src={image}
          alt={title}
          className={styles.image}
          loading="eager"
        />

      </div>

      {/* ============================== */}
      {/* title */}
      {/* ============================== */}

      <h3 className={styles.title}>
        {title}
      </h3>

      {/* ============================== */}
      {/* grouped semantic */}
      {/* ============================== */}

      {Object.keys(groupedAttributes)
        .length > 0 && (
        <div className={styles.groupedArea}>

          {Object.entries(
            groupedAttributes
          ).map(
            ([group, attrs]) => (
              <div
                key={group}
                className={
                  styles.groupBlock
                }
              >

                <div
                  className={
                    styles.groupTitle
                  }
                >
                  {group}
                </div>

                <SemanticSection
                  attributes={attrs}
                />

              </div>
            )
          )}

        </div>
      )}

      {/* ============================== */}
      {/* fallback semantic */}
      {/* ============================== */}

      {Object.keys(groupedAttributes)
        .length === 0 &&
        attributes.length > 0 && (
          <div className={styles.spec}>

            <SemanticSection
              attributes={attributes}
            />

          </div>
        )}

    </section>
  )
}
