// ============================================================================
// FILE:
// /app/catalog/components/EmptyProducts.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../styles/catalog.module.css'

/* ============================================================================
🔥 Empty Products
============================================================================ */

export default function EmptyProducts() {

    return (

        <section
            className={
                styles.emptyProducts
            }
        >

            <h2
                className={
                    styles.emptyProductsTitle
                }
            >

                商品が見つかりません

            </h2>

            <p
                className={
                    styles.emptyProductsText
                }
            >

                現在表示できる商品はありません。

            </p>

        </section>

    )

}