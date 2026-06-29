// ============================================================================
// FILE:
// /app/pc-finder/components/ProductCard.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
Next
============================================================================ */

// import Image
//     from 'next/image'

import Link
    from 'next/link'

/* ============================================================================
Styles
============================================================================ */

import styles
    from '../styles/pcFinder.module.css'

/* ============================================================================
Types
============================================================================ */

type Props = {

    product: {

        product_id: number

        unique_id: string

        name: string

        maker: string

        image_url: string

        price: number

        semantic_labels?: string[]

    }


}

/* ============================================================================
Product Card
============================================================================ */

export default function ProductCard({

    product,

}: Props) {

    return (

        <article
            className={
                styles.productCard
            }
        >

            {/* ==========================================================
            Image
            ========================================================== */}

            <div
                className={
                    styles.productImage
                }
            >

                <img

                    src={
                        product.image_url
                    }

                    alt={
                        product.name
                    }

                    // fill

                    sizes="400px"

                    className={
                        styles.image
                    }

                />

            </div>

            {/* ==========================================================
            Content
            ========================================================== */}

            <div
                className={
                    styles.productContent
                }
            >

                <div
                    className={
                        styles.productMaker
                    }
                >

                    {product.maker.toUpperCase()}

                </div>

                <h3
                    className={
                        styles.productTitle
                    }
                >

                    {product.name}

                </h3>

                <div
                    className={
                        styles.productPrice
                    }
                >

                    ¥{product.price.toLocaleString()}

                </div>

                {
                    
                    (product ?? []).semantic_labels?.length
                        ?

                        <div
                            className={
                                styles.labelArea
                            }
                        >

                            {

                                (product.semantic_labels ?? []).map(

                                    label => (

                                        <span
                                            key={label}
                                            className={
                                                styles.label
                                            }
                                        >

                                            {label}

                                        </span>

                                    )

                                )

                            }

                        </div>

                        :

                        null

                }

                <Link

                    href={`/product/${product.unique_id}`}

                    className={
                        styles.detailButton
                    }

                >

                    製品を見る →

                </Link>

            </div>

        </article>

    )

}