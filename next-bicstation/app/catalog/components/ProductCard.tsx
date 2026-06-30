// ============================================================================
// FILE:
// /app/catalog/components/ProductCard.tsx
// ============================================================================

'use client'

/* ============================================================================
Next
============================================================================ */

import Link
    from 'next/link'

/* ============================================================================
Experience Components
============================================================================ */

import ProductImage
    from '@/app/experience/components/product/ProductImage'
import ProductTitle
    from '@/app/experience/components/product/ProductTitle'
import ProductMaker
    from '@/app/experience/components/product/ProductMaker'
import ProductPrice
    from '@/app/experience/components/product/ProductPrice'
/* ============================================================================
Contracts
============================================================================ */

import type {

    PCProductItem,

} from '@/shared/lib/api/django/pc/products/contracts'

/* ============================================================================
Styles
============================================================================ */

import styles
    from '../styles/catalog.module.css'

/* ============================================================================
Props
============================================================================ */

type Props = {

    product: PCProductItem

}

/* ============================================================================
Experience

Product Presentation

Responsibilities

- Present one product
- Display Backend Runtime
- Navigate to Product Detail

This component does NOT

- Generate Runtime
- Generate Semantic Meaning
- Interpret Semantic Reality

============================================================================ */

export default function ProductCard({

    product,

}: Props) {

    return (

        <Link

            href={`/product/${product.unique_id}`}

            className={styles.productCard}

        >

            <ProductImage

                src={product.image_url}

                alt={product.name}

                className={styles.productImage}

            />

            <div className={styles.productContent}>

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