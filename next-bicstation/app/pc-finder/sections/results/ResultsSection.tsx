// ============================================================================
// FILE:
// /app/pc-finder/sections/results/ResultsSection.tsx
// ============================================================================

'use client'

/* ============================================================================
Components
============================================================================ */

import ProductCard
    from '../../components/ProductCard'

/* ============================================================================
Styles
============================================================================ */

import styles
    from './ResultsSection.module.css'

/* ============================================================================
Contracts
============================================================================ */

import type {

    ProjectedProduct,

} from '@/shared/lib/api/django/pc/finder'

/* ============================================================================
Props
============================================================================ */

type Props = {

    products: ProjectedProduct[]

}

/* ============================================================================
Journey

Discovery Evidence

Presents the Runtime products that support
the recommendation experience.

Responsibilities

- Present Runtime products
- Display Discovery Evidence
- Support product evaluation

This section does NOT

- Execute Runtime
- Generate Semantic Meaning
- Generate Recommendation Logic
- Rank Products

============================================================================ */

export default function ResultsSection({

    products,

}: Props) {

    const items = products ?? []

    const hasProducts = items.length > 0

    return (

        <section
            className={styles.section}
        >

            {/* ==========================================================
                Section Header
            ========================================================== */}

            <div
                className={styles.header}
            >

                <span
                    className={styles.badge}
                >

                    DISCOVERY EVIDENCE

                </span>

                <h2
                    className={styles.title}
                >

                    おすすめの製品

                </h2>

                <p
                    className={styles.description}
                >

                    Semantic Reality が選択条件に最も一致すると判断した製品をご紹介します。

                </p>

            </div>

            {/* ==========================================================
                Product Results
            ========================================================== */}

            {hasProducts ? (

                <div
                    className={styles.grid}
                >

                    {items.map(product => (

                        <ProductCard
                            product={product}
                        />

                    ))}

                </div>

            ) : (

                <div
                    className={styles.empty}
                >

                    条件に一致する製品は見つかりませんでした。

                </div>

            )}

        </section>

    )

}