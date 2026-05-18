// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/components/cards/ProductCard.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Semantic Product Card
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic discovery renderer
 *   - workflow-oriented product presentation
 *   - compact runtime exploration card
 *
 * IMPORTANT:
 *   - semantic authority is backend
 *   - frontend renders discovery UX only
 *
 * ============================================================================
 */

import Link from 'next/link'

import styles from '../../styles/card.module.css'

import ProductCardImage from './ProductCardImage'

import ProductCardContent from './ProductCardContent'

import type {
  ProductCardProps,
} from '../../types/product'

/* ============================================================================
🔥 Product Card
============================================================================ */

export default function ProductCard({

  product,

}: ProductCardProps) {

  /* ==========================================================================
  🔥 Href
  ========================================================================== */

  const href =
    `/product/${product?.unique_id}`

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <Link
      href={href}
      className={styles.card}
    >

      {/* ================================================================
      Image
      ================================================================ */}

      <ProductCardImage
        product={product}
      />

      {/* ================================================================
      Content
      ================================================================ */}

      <ProductCardContent
        product={product}
      />

    </Link>

  )
}