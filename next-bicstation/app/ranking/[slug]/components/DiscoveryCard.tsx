// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/DiscoveryCard.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import ProductSemanticChips from './ProductSemanticChips'

import styles from '../styles/discovery-grid.module.css'

type Props = {
  product: any
  rank?: number
}

/* ============================================================================
🔥 Discovery Card
============================================================================ */

export default function DiscoveryCard({
  product,
  rank,
}: Props) {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const price =

    typeof product?.price === 'number'

      ? `¥${product.price.toLocaleString()}`

      : null

  const maker =

    product?.maker
    ||
    product?.site_prefix
    ||
    'SHIN CORE LINX'

  const description =

    product?.description
    ||
    'semantic runtime が高い関連性を検出した discovery model。'

  const semanticRole =

    product?.semantic_role
    ||
    'あなたに近いおすすめ構成'

  /* ==========================================================================
  🔥 CTA
  ========================================================================== */

  const ctaLabel = (() => {

    const usage =

      JSON.stringify(
        product?.grouped_attributes || {}
      )

    if (
      usage.includes('gaming')
    ) {

      return 'ゲーム性能を見る'
    }

    if (
      usage.includes('creator')
    ) {

      return '制作性能を見る'
    }

    if (
      usage.includes('business')
    ) {

      return '仕事性能を見る'
    }

    if (
      usage.includes('ai')
    ) {

      return 'AI性能を見る'
    }

    return 'この構成を詳しく見る'

  })()

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <article
      className={styles.discoveryCard}
    >

      {/* ================================================================
      Glow
      ================================================================ */}

      <div
        className={styles.discoveryGlow}
      />

      {/* ================================================================
      Rank
      ================================================================ */}

      <div
        className={styles.discoveryRank}
      >

        {rank}

      </div>

      {/* ================================================================
      Image
      ================================================================ */}

      <div
        className={
          styles.discoveryImageWrap
        }
      >

        <img
          src={
            product?.image_url
          }
          alt={
            product?.name
          }
          className={
            styles.discoveryImage
          }
        />

      </div>

      {/* ================================================================
      Content
      ================================================================ */}

      <div
        className={
          styles.discoveryContent
        }
      >

        {/* ============================================================
        Semantic Role
        ============================================================ */}

        <div
          className={
            styles.discoveryRole
          }
        >

          {semanticRole}

        </div>

        {/* ============================================================
        Title
        ============================================================ */}

        <h3
          className={
            styles.discoveryTitle
          }
        >

          {product?.name}

        </h3>

        {/* ============================================================
        Price
        ============================================================ */}

        {price && (

          <div
            className={
              styles.discoveryPrice
            }
          >

            {price}

          </div>

        )}

        {/* ============================================================
        Maker
        ============================================================ */}

        <div
          className={
            styles.discoveryMaker
          }
        >

          {maker}

        </div>

        {/* ============================================================
        Description
        ============================================================ */}

        <p
          className={
            styles.discoveryDescription
          }
        >

          {description}

        </p>

        {/* ============================================================
        Semantic Chips
        ============================================================ */}

        <ProductSemanticChips
          groupedAttributes={
            product?.grouped_attributes
          }
        />

        {/* ============================================================
        CTA
        ============================================================ */}

        <div
          className={
            styles.discoveryFooter
          }
        >

          <Link
            href={
              product?.url || '#'
            }
            target="_blank"
            className={
              styles.discoveryButton
            }
          >

            {ctaLabel}

          </Link>

        </div>

      </div>

    </article>

  )
}