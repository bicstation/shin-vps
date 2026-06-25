// ============================================================================
// FILE:
// /app/catalog/components/ProductCard.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Link
    from 'next/link'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

    CatalogProduct,

} from '../types/catalog'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../styles/catalog.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    product:
    CatalogProduct

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

            <img

                src={
                    product.image_url
                    || '/images/no-image.png'
                }

                alt={
                    product.name
                }

                className={
                    styles.productImage
                }

                loading="lazy"

            />

            {/* ==========================================================
      CONTENT
      ========================================================== */}

            <div
                className={
                    styles.productContent
                }
            >

                <h3
                    className={
                        styles.productName
                    }
                >

                    {product.name}

                </h3>

                {

                    product.maker && (

                        <p
                            className={
                                styles.productMaker
                            }
                        >

                            {product.maker}

                        </p>

                    )

                }

                {

                    product.price !== undefined && (

                        <p
                            className={
                                styles.productPrice
                            }
                        >

                            ¥

                            {product.price.toLocaleString()}

                        </p>

                    )

                }

            </div>

        </Link>

    )

}