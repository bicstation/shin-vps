// ============================================================================
// FILE:
// /app/catalog/components/EmptyProducts.tsx
// ============================================================================

'use client'

/* ============================================================================
Styles
============================================================================ */

import styles
    from '../styles/catalog.module.css'

/* ============================================================================
Experience

Empty State

Communicates that the current Runtime
contains no available products.

Responsibilities

- Present empty state
- Guide the user
- Maintain experience continuity

This component does NOT

- Generate Runtime
- Generate Semantic Meaning
- Interpret Semantic Reality

============================================================================ */

export default function EmptyProducts() {

    return (

        <section
            className={styles.emptyProducts}
        >

            <h2
                className={styles.emptyProductsTitle}
            >

                商品が見つかりません

            </h2>

            <p
                className={styles.emptyProductsText}
            >

                現在表示できる商品はありません。

            </p>

        </section>

    )

}