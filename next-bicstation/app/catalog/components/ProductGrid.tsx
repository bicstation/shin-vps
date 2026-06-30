// ============================================================================
// FILE:
// /app/catalog/components/ProductGrid.tsx
// ============================================================================

'use client'

/* ============================================================================
Contracts
============================================================================ */

import type {

    PCProductItem,

} from '@/shared/lib/api/django/pc/products/contracts'

/* ============================================================================
Components
============================================================================ */

import ProductCard
    from './ProductCard'

import EmptyProducts
    from './EmptyProducts'

/* ============================================================================
Styles
============================================================================ */

import styles
    from '../styles/catalog.module.css'

/* ============================================================================
Props
============================================================================ */

type Props = {

    products: PCProductItem[]

}

/* ============================================================================
Experience

Products Presentation

Responsibilities

- Present Runtime products
- Render Product Cards
- Present Empty State

This component does NOT

- Generate Runtime
- Generate Semantic Meaning
- Interpret Semantic Reality

============================================================================ */

export default function ProductGrid({

    products,

}: Props) {

    if (!products || products.length === 0) {

        return <EmptyProducts />

    }

    return (

        <section className={styles.productSection}>

            <div className={styles.productGrid}>

                {products.map((product) => (

                    <ProductCard

                        key={product.unique_id}

                        product={product}

                    />

                ))}

            </div>

        </section>

    )

}