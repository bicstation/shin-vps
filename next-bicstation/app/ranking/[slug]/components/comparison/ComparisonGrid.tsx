// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/comparison/ComparisonGrid.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

    RankingProduct,

} from '../../types/contracts'

/* ============================================================================
🔥 Components
============================================================================ */

import ComparisonCard
    from './ComparisonCard'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/comparison/comparison-grid.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    products?: RankingProduct[]

    startRank?: number

}

/* ============================================================================
🔥 Comparison Grid
============================================================================ */

export default function ComparisonGrid({

    products = [],

    startRank = 2,

}: Props) {

    /* =========================================================================
    🔥 Empty
    ========================================================================= */

    if (

        products.length === 0

    ) {

        return null

    }

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={styles.section}
        >

            {/* ==========================================================
            Header
            ========================================================== */}

            <header
                className={styles.header}
            >

                <div
                    className={styles.eyebrow}
                >

                    FEATURED CANDIDATES

                </div>

                <h2
                    className={styles.title}
                >

                    注目ランキング

                </h2>

                <p
                    className={styles.description}
                >

                    上位候補を比較しながら、
                    あなたに最適な1台を見つけられます。

                </p>

            </header>

            {/* ==========================================================
            Grid
            ========================================================== */}

            <div
                className={styles.grid}
            >

                {

                    products.map(

                        (

                            product,

                            index,

                        ) => (

                            <ComparisonCard

                                key={

                                    product.unique_id

                                    ??

                                    index

                                }

                                product={

                                    product

                                }

                                rank={

                                    startRank + index

                                }

                            />

                        )

                    )

                }

            </div>

        </section>

    )

}