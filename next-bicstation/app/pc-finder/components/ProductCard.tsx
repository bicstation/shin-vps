// ============================================================================
// FILE:
// /app/pc-finder/components/ProductCard.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Link
    from 'next/link'

/* ============================================================================
🔥 Experience Components
============================================================================ */

import ProductImage
    from '@/app/experience/components/product/ProductImage'

import ProductTitle
    from '@/app/experience/components/product/ProductTitle'

import ProductPrice
    from '@/app/experience/components/product/ProductPrice'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../styles/pcFinder.module.css'

/* ============================================================================
🔥 Projection
============================================================================ */

import type {

    ProjectedProduct,

} from '@/shared/lib/api/django/pc/finder'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    product: ProjectedProduct

}

/* ============================================================================
🔥 Discovery Evidence Unit

Represents one Runtime product.

Responsibilities

✓ Present Runtime product
✓ Present Runtime Reality
✓ Support product comparison

This component SHALL NOT

✗ Execute Runtime
✗ Generate Semantic Meaning
✗ Rank Products

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

                    src={product.image}

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

                {/* ======================================================
                    Maker
                ====================================================== */}

                <div
                    className={styles.productMaker}
                >

                    {product.maker.toUpperCase()}

                </div>

                {/* ======================================================
                    Title
                ====================================================== */}

                <ProductTitle

                    title={product.name}

                    className={styles.productTitle}

                />

                {/* ======================================================
                    Price
                ====================================================== */}

                <ProductPrice

                    price={product.price}

                    className={styles.productPrice}

                />

                {/* ======================================================
                    Semantic Tags
                ====================================================== */}

                {

                    product.tags.length > 0 && (

                        <div
                            className={styles.labelArea}
                        >

                            {

                                product.tags.map(tag => (

                                    <span

                                        key={tag}

                                        className={styles.label}

                                    >

                                        {tag}

                                    </span>

                                ))

                            }

                        </div>

                    )

                }

                {/* ======================================================
                    Product Detail
                ====================================================== */}

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