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

import ProductImage
  from '@/app/experience/components/product/ProductImage'

import ProductTitle
  from '@/app/experience/components/product/ProductTitle'

import ProductMaker
  from '@/app/experience/components/product/ProductMaker'

import ProductPrice
  from '@/app/experience/components/product/ProductPrice'

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

      <ProductImage
        src={product.image_url}
        alt={product.name}
        className={styles.productImage}
      />


      {/* ==========================================================
      CONTENT
      ========================================================== */}

      <div
        className={
          styles.productContent
        }
      >

        <ProductTitle
          title={product.name}
          className={styles.productName}
        />

        <ProductMaker
          maker={product.maker}
          className={styles.productMaker}
        />

        <ProductPrice
          price={product.price}
          className={styles.productPrice}
        />

      </div>

    </Link>

  )

}