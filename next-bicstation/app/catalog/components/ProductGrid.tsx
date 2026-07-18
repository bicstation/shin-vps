// ============================================================================
// FILE:
// /app/catalog/components/ProductGrid.tsx
// ============================================================================

'use client'

import type { PCProductItem } from '@/shared/lib/api/django/pc/products/contracts'

import ProductCard from './ProductCard'
import EmptyProducts from './EmptyProducts'

import styles from '../styles/catalog.module.css'

type Props = {

    products: PCProductItem[]

}

export default function ProductGrid({

    products,

}: Props) {

    if (products.length === 0) {

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