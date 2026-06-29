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
Types
============================================================================ */

import type {

    FinderProduct,

} from '../../types/finder'

/* ============================================================================
Props
============================================================================ */

type Props = {

    products: FinderProduct[]

}

/* ============================================================================
Results Section
============================================================================ */

export default function ResultsSection({

    products,

}: Props) {

    return (

        <section
            className={
                styles.section
            }
        >

            <div
                className={
                    styles.header
                }
            >

                <span
                    className={
                        styles.badge
                    }
                >

                    RESULTS

                </span>

                <h2
                    className={
                        styles.title
                    }
                >

                    おすすめの製品

                </h2>

                <p
                    className={
                        styles.description
                    }
                >

                    Semantic Reality が選択条件に最も一致すると判断した製品です。

                </p>

            </div>

            {

                (products ?? []).length === 0

                    ? (

                        <div
                            className={
                                styles.empty
                            }
                        >

                            条件に一致する製品は見つかりませんでした。

                        </div>

                    )

                    : (

                        <div
                            className={
                                styles.grid
                            }
                        >

                            {

                                (products ?? [] ).map(

                                    product => (

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

                    )

            }

        </section>

    )

}