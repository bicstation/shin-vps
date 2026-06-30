// ============================================================================
// FILE:
// /app/pc-finder/components/ProductCard.tsx
// Copyright (c) 2026 Shin Corporation.
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
// import ProductMaker
//   from '@/app/experience/components/product/ProductMaker'
import ProductPrice
    from '@/app/experience/components/product/ProductPrice'


/* ============================================================================
Styles
============================================================================ */

import styles
    from '../styles/pcFinder.module.css'

/* ============================================================================
Contracts
============================================================================ */

import type {

    FinderProductContract,

} from '@/shared/lib/api/django/pc/finder/contracts'

/* ============================================================================
Props
============================================================================ */

type Props = {

    product: FinderProductContract

}

/* ============================================================================
Discovery Evidence Unit

Represents one Runtime product.

Responsibilities

- Present one Runtime product
- Present Runtime Reality
- Support product comparison

This component does NOT

- Execute Runtime
- Generate Semantic Meaning
- Rank Products

============================================================================ */

export default function ProductCard({

    product,

}: Props) {

    return (

        <article
            className={styles.productCard}
        >

            {/* ==========================================================
                Product Image
            ========================================================== */}

            <div
                className={styles.productImage}
            >

                <ProductImage

                    src={product.image_url}

                    alt={product.name}

                    width={400}

                    height={400}

                    className={styles.image}

                />

            </div>

            {/* ==========================================================
                Product Information
            ========================================================== */}

            <div
                className={styles.productContent}
            >

                <div
                    className={styles.productMaker}
                >

                    {product.maker.toUpperCase()}

                </div>

                <ProductTitle
                    title={product.name}
                    className={styles.productTitle}
                />

                <ProductPrice
                    price={product.price}
                    className={styles.productPrice}
                />

                {/* ==========================================================
                    Runtime Reality
                ========================================================== */}

                {product.semantic_labels?.length ? (

                    <div
                        className={styles.labelArea}
                    >

                        {product.semantic_labels.map(label => (

                            <span

                                key={label}

                                className={styles.label}

                            >

                                {label}

                            </span>

                        ))}

                    </div>

                ) : null}

                {/* ==========================================================
                    Product Detail
                ========================================================== */}

                <Link

                    href={`/product/${product.unique_id}`}

                    className={styles.detailButton}

                >

                    製品を見る →

                </Link>

            </div>

        </article>

    )

}