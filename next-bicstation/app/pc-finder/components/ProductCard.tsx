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

                <img

                    src={product.image_url}

                    alt={product.name}

                    sizes="400px"

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

                <h3
                    className={styles.productTitle}
                >

                    {product.name}

                </h3>

                <div
                    className={styles.productPrice}
                >

                    ¥{product.price.toLocaleString()}

                </div>

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