// ============================================================================
// FILE:
// /app/catalog/components/ProductGrid.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

    CatalogProduct,

} from '../types/catalog'

/* ============================================================================
🔥 Components
============================================================================ */

import ProductCard
    from './ProductCard'

import EmptyProducts
    from './EmptyProducts'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../styles/catalog.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    products:
    CatalogProduct[]

}

/* ============================================================================
🔥 Product Grid
============================================================================ */

export default function ProductGrid({

    products,

}: Props) {

    /* ==========================================================================
    🔥 Runtime Verification
    ========================================================================== */

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '🔥 PRODUCT GRID'
    )

    console.log({

        products:
            products?.length,

        first_product:

            products?.[0]?.unique_id,

        last_product:

            products?.[
                products.length - 1
            ]?.unique_id,

    })

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ==========================================================================
    🔥 Empty
    ========================================================================== */

    if (

        !products ||

        products.length === 0

    ) {

        return (

            <EmptyProducts />

        )

    }

    /* ==========================================================================
    🔥 Render
    ========================================================================== */

    console.log(

        '🔥 PRODUCT GRID MAP',

        products.length

    )

    return (

        <section
            className={
                styles.productSection
            }
        >

            <div
                className={
                    styles.productGrid
                }
            >

                {

                    products.map(

                        (

                            product

                        ) => (

                            <ProductCard

                                key={
                                    product.unique_id
                                }

                                product={
                                    product
                                }

                            />

                        )

                    )

                }

            </div>

        </section>

    )

}